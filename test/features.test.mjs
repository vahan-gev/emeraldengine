import { test } from "node:test";
import assert from "node:assert/strict";

import { Physics, Vector2, Vector3 } from "../src/Physics.js";
import RigidBody from "../src/components/RigidBody.js";
import BoxCollider from "../src/components/BoxCollider.js";
import CollisionLayers from "../src/CollisionLayers.js";
import InputManager from "../src/managers/InputManager.js";
import ParticleEmitter from "../src/ParticleEmitter.js";
import TiledMap from "../src/importers/TiledMap.js";
import Aseprite from "../src/importers/Aseprite.js";

test("CollisionLayers assigns sequential category bits", () => {
  CollisionLayers.reset();
  // Each new name claims the next power-of-two bit.
  assert.equal(CollisionLayers.bit("ground"), 1);
  assert.equal(CollisionLayers.bit("player"), 2);
  assert.equal(CollisionLayers.bit("enemy"), 4);
  assert.equal(CollisionLayers.bit("ground"), 1); // re-asking is stable
});

test("CollisionLayers.mask ORs names and handles 'all'", () => {
  CollisionLayers.reset();
  CollisionLayers.define("ground", "player", "enemy");
  assert.equal(CollisionLayers.mask(["ground", "enemy"]), 1 | 4); // bits ORed together
  assert.equal(CollisionLayers.mask("player"), 2);
  assert.equal(CollisionLayers.mask("all"), 0xffff);
  assert.equal(CollisionLayers.mask(null), 0xffff); // no filter means collide with everything
  assert.equal(CollisionLayers.mask(8), 8); // a raw bitmask passes through untouched
});

test("Collider.setCategory / setCollidesWith write planck filter data", () => {
  CollisionLayers.reset();
  CollisionLayers.define("ground", "player", "enemy");
  const physics = new Physics(10, 30);
  const body = new RigidBody(physics, "dynamic", new Vector2(0, 0), true);
  const col = new BoxCollider(body, new Vector2(1, 1), 1, 0, 0, false, null, {
    category: "player",
    collidesWith: ["ground", "enemy"],
  });
  const f = col.getFilter();
  assert.equal(f.category, 2);
  assert.equal(f.mask, 1 | 4);
  assert.equal(col.collider.getFilterCategoryBits(), 2);
  assert.equal(col.collider.getFilterMaskBits(), 1 | 4);
});

test("RigidBody.setContinuous toggles planck bullet flag", () => {
  const physics = new Physics(10, 30);
  const body = new RigidBody(physics, "dynamic", new Vector2(0, 0), true);
  assert.equal(body.isContinuous(), false);
  body.setContinuous(true);
  assert.equal(body.isContinuous(), true);
  body.setContinuous(false);
  assert.equal(body.isContinuous(), false);
});

test("CCD stops a fast body from tunneling through a thin wall", () => {
  const physics = new Physics(0, 30);
  const wallBody = new RigidBody(physics, "static", new Vector2(5, 0), true);
  new BoxCollider(wallBody, new Vector2(0.1, 5), 0, 0, 0);

  const ball = new RigidBody(physics, "dynamic", new Vector2(0, 0), true);
  new BoxCollider(ball, new Vector2(0.2, 0.2), 1, 0, 0);
  ball.setContinuous(true);
  ball.setLinearVelocity(6000, 0);

  for (let i = 0; i < 30; i++) physics.process(1 / 60);

  // The wall sits at 5m and Physics was built with 30 px/m, so 5 * 30 is the
  // wall in world units. Without CCD the ball tunnels straight past it.
  assert.ok(
    ball.getWorldX() < 5 * 30,
    `expected body to be stopped before the wall, got x=${ball.getWorldX()}`
  );
});

function makeStubEmitter(capacity = 8) {
  const added = [];
  const scene = { add: (go) => added.push(go), remove: () => {} };
  const spriteFactory = () => ({
    setUseLighting() {},
    setColor() {},
    setBlendMode() {},
    setParent() {},
  });
  const fx = new ParticleEmitter(scene, { capacity, spriteFactory });
  return { fx, added };
}

test("ParticleEmitter pools and recycles particles", () => {
  // The pool is allocated up front: capacity sprites are added immediately.
  const { fx, added } = makeStubEmitter(8);
  assert.equal(added.length, 8);
  assert.equal(fx.activeCount, 0);

  fx.burst(5, { x: 0, y: 0, speed: 100, life: 1, spread: Math.PI });
  assert.equal(fx.activeCount, 5);

  for (let i = 0; i < 20; i++) fx.update(0.1); // 2s elapsed, past the 1s lifetime
  assert.equal(fx.activeCount, 0);

  // All 8 are available again, proving they were recycled rather than leaked.
  fx.burst(8, { x: 0, y: 0, speed: 50, life: 0.5 });
  assert.equal(fx.activeCount, 8);
});

test("ParticleEmitter never exceeds capacity", () => {
  const { fx } = makeStubEmitter(4);
  fx.burst(100, { x: 0, y: 0, life: 5, speed: 10 }); // asking for 100 from a pool of 4
  assert.equal(fx.activeCount, 4);
});

test("ParticleEmitter integrates motion and gravity", () => {
  const { fx } = makeStubEmitter(4);
  fx.emit({ x: 0, y: 0, dir: Math.PI / 2, spread: 0, speed: 100, gy: -100, life: 5 });
  const p = fx.parts.find((q) => q.alive);
  const y0 = p.y;
  const vy0 = p.vy;
  fx.update(0.05);
  assert.ok(p.y > y0, "particle should move along its upward velocity");
  assert.ok(p.vy < vy0, "gravity should reduce upward velocity each step");
});

function fakeTarget() {
  return { addEventListener() {}, removeEventListener() {} };
}

function stubGamepads(pads) {
  const prev = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    value: { getGamepads: () => pads },
    configurable: true,
  });
  return () => {
    if (prev) Object.defineProperty(globalThis, "navigator", prev);
    else delete globalThis.navigator;
  };
}

function pad(buttonsDown = [], axes = [], extra = {}) {
  const buttons = [];
  for (let i = 0; i < 17; i++) buttons[i] = { pressed: buttonsDown.includes(i), value: 0 };
  return { buttons, axes, mapping: "standard", id: "Test Pad", index: 0, ...extra };
}

test("InputManager reads deadzoned analog axes", () => {
  const input = new InputManager({ target: fakeTarget(), gamepadDeadzone: 0.3 });
  // Deadzone 0.3 rescales the remaining 0.3..1 range back onto 0..1, so a raw
  // 0.8 becomes 0.5/0.7 and anything under the deadzone reads as a flat 0.
  input.gamepads = [pad([], [-0.8, 0.1, 0.5, 1.0])];
  assert.ok(Math.abs(input.getGamepadAxis(0) - -(0.5 / 0.7)) < 1e-9);
  assert.equal(input.getGamepadAxis(1), 0); // 0.1 is inside the deadzone
  assert.ok(Math.abs(input.getGamepadAxis(2) - 0.2 / 0.7) < 1e-9);
  assert.equal(input.getGamepadAxis(3), 1); // full deflection still reaches exactly 1
  input.destroy();
});

test("InputManager builds button / dpad / axis tokens", () => {
  const input = new InputManager({ target: fakeTarget() });
  // Button 0 plus dpad-left (button 14), and a hard-left stick on axis 0.
  input.gamepads = [pad([0, 14], [-0.9, 0, 0, 0])];
  input._collectGamepadTokens();
  assert.ok(input._gamepadTokens.has("pad:0:0"));
  assert.ok(input._gamepadTokens.has("pad:0:14"));
  assert.ok(input._gamepadTokens.has("pad:0:dpadLeft"));
  assert.ok(input._gamepadTokens.has("gamepad:0"));
  assert.ok(input._gamepadTokens.has("pad:0:axis0-"));
  assert.ok(!input._gamepadTokens.has("pad:0:axis0+")); // opposite direction must not fire
  input.destroy();
});

test("InputManager emits semantic button names + aliases", () => {
  const input = new InputManager({ target: fakeTarget() });
  // Standard mapping: 0 = south (A/cross), 5 = R1/RB, 9 = start.
  input.gamepads = [pad([0, 5, 9], [])];
  input._collectGamepadTokens();
  const t = input._gamepadTokens;
  assert.ok(t.has("pad:0:south"));
  assert.ok(t.has("pad:0:a"));
  assert.ok(t.has("pad:0:cross"));
  assert.ok(t.has("pad:0:r1"));
  assert.ok(t.has("pad:0:rb"));
  assert.ok(t.has("pad:0:start"));
  assert.ok(t.has("pad:0:0"));
  assert.ok(!t.has("pad:0:north")); // button 3 was never pressed
  input.destroy();
});

test("InputManager getGamepadButton resolves names and stick", () => {
  const input = new InputManager({ target: fakeTarget() });
  input.gamepads = [pad([3], [0.9, -0.4, 0, 0])]; // button 3 = north (Y/triangle)
  assert.equal(input.getGamepadButton("north").pressed, true);
  assert.equal(input.getGamepadButton("y").pressed, true);
  assert.equal(input.getGamepadButton("south").pressed, false);
  const stick = input.getGamepadStick("left");
  // Deadzone scaling shortens the vector but must not rotate it.
  const rawAngle = Math.atan2(-0.4, 0.9);
  assert.ok(Math.abs(Math.atan2(stick.y, stick.x) - rawAngle) < 1e-9);
  assert.ok(stick.magnitude > 0 && stick.magnitude <= 1);
  input.destroy();
});

test("InputManager applies a custom mapping for non-standard pads", () => {
  InputManager.registerGamepadMapping("weirdpad", { buttons: { south: 1, east: 2 } });
  const input = new InputManager({ target: fakeTarget() });

  // A standard pad keeps the standard indices...
  input.gamepads = [pad([0], [], { mapping: "standard", id: "Xbox" })];
  assert.equal(input.getGamepadButton("south").index, 0);

  // ...while the registered profile moves south to button 1 for this id.
  input.gamepads = [pad([1], [], { mapping: "", id: "WeirdPad 9000" })];
  input._collectGamepadTokens();
  assert.equal(input.getGamepadButton("south").index, 1);
  assert.ok(input._gamepadTokens.has("pad:0:south"));
  input.destroy();
});

test("InputManager reports connection info and pressed buttons", () => {
  const input = new InputManager({ target: fakeTarget() });
  input.gamepads = [pad([2, 7], [], { id: "Pad A", mapping: "standard" })];
  const info = input.getGamepadInfo(0);
  assert.equal(info.id, "Pad A");
  assert.equal(info.standard, true);
  assert.deepEqual(input.getPressedButtons(0), [2, 7]);
  assert.equal(input.isGamepadConnected(0), true);
  assert.equal(input.isGamepadConnected(1), false);
  input.destroy();
});

test("InputManager detects gamepad justPressed edges across frames", () => {
  const input = new InputManager({ target: fakeTarget() });
  input.mapAction("jump", ["pad:0:0"]);

  // Frame 1: nothing held.
  let restore = stubGamepads([pad([], [])]);
  input.update();
  assert.equal(input.justPressed("jump"), false);
  restore();

  // Frame 2: freshly pressed, so isDown and justPressed both fire.
  restore = stubGamepads([pad([0], [])]);
  input.update();
  assert.equal(input.isDown("jump"), true);
  assert.equal(input.justPressed("jump"), true);
  restore();

  // Frame 3: still held, so the edge is gone but isDown remains.
  restore = stubGamepads([pad([0], [])]);
  input.update();
  assert.equal(input.justPressed("jump"), false);
  assert.equal(input.isDown("jump"), true);
  restore();

  // Frame 4: released, so the release edge fires once.
  restore = stubGamepads([pad([], [])]);
  input.update();
  assert.equal(input.justReleased("jump"), true);
  restore();
  input.destroy();
});

const TILED_MAP = {
  width: 3,
  height: 2,
  tilewidth: 16,
  tileheight: 16,
  tilesets: [{ firstgid: 1, columns: 4, tilecount: 16, tilewidth: 16, tileheight: 16 }],
  layers: [
    {
      type: "tilelayer",
      name: "ground",
      width: 3,
      height: 2,
      data: [1, 0, 3, 2, 2, 0x80000000 | 4],
    },
    {
      type: "objectgroup",
      name: "spawns",
      objects: [
        {
          id: 1,
          name: "start",
          type: "spawn",
          x: 16,
          y: 32,
          width: 8,
          height: 8,
          properties: [{ name: "team", value: 1 }],
        },
      ],
    },
  ],
};

test("TiledMap.toFrameGrid converts gids to local frame indices", () => {
  // gid 0 means empty (-1); other gids drop the firstgid offset, and the
  // 0x80000000 flip flag is stripped before that subtraction.
  const grid = TiledMap.toFrameGrid(TILED_MAP);
  assert.deepEqual(grid[0], [0, -1, 2]);
  assert.deepEqual(grid[1], [1, 1, 3]);
});

test("TiledMap.objects flattens properties and can flip y", () => {
  const raw = TiledMap.objects(TILED_MAP, { layer: "spawns" });
  assert.equal(raw[0].name, "start");
  assert.equal(raw[0].props.team, 1);
  assert.equal(raw[0].y, 32);

  const flipped = TiledMap.objects(TILED_MAP, { layer: "spawns", flipY: true });
  assert.equal(flipped[0].y, 0); // map is 2 * 16 = 32 tall, so y 32 flips to 0
});

const ASE_SHEET = {
  frames: {
    "hero 0": { frame: { x: 0, y: 0, w: 16, h: 16 }, duration: 100 },
    "hero 1": { frame: { x: 16, y: 0, w: 16, h: 16 }, duration: 100 },
    "hero 2": { frame: { x: 32, y: 0, w: 16, h: 16 }, duration: 80 },
    "hero 3": { frame: { x: 0, y: 16, w: 16, h: 16 }, duration: 80 },
  },
  meta: {
    size: { w: 48, h: 32 },
    frameTags: [
      { name: "idle", from: 0, to: 1, direction: "forward" },
      { name: "run", from: 2, to: 3, direction: "reverse" },
    ],
  },
};

test("Aseprite.spriteConfig derives a uniform grid", () => {
  // A 48x32 sheet of 16x16 frames is a 3-wide grid holding 4 frames.
  const cfg = Aseprite.spriteConfig(ASE_SHEET);
  assert.equal(cfg.frameWidth, 16);
  assert.equal(cfg.frameHeight, 16);
  assert.equal(cfg.framesPerRow, 3);
  assert.equal(cfg.totalFrames, 4);
});

test("Aseprite.toClips builds frame ranges with direction + speed", () => {
  const clips = Aseprite.toClips(ASE_SHEET);
  const idle = clips.find((c) => c.name === "idle");
  const run = clips.find((c) => c.name === "run");
  assert.deepEqual(idle.frames, [0, 1]);
  assert.equal(idle.speed, 100);
  assert.deepEqual(run.frames, [3, 2]); // tagged "reverse", so the range runs backwards
  assert.equal(run.speed, 80); // speed comes from the frames' duration
});

test("Aseprite.applyTo registers clips on an animator-like object", () => {
  const registered = {};
  const animator = {
    addClip(name, frames, opts) {
      registered[name] = { frames, opts };
      return this;
    },
  };
  Aseprite.applyTo(animator, ASE_SHEET, { loop: { run: false } });
  assert.deepEqual(registered.idle.frames, [0, 1]);
  assert.equal(registered.idle.opts.loop, true);
  assert.equal(registered.run.opts.loop, false);
});

class FakeAudio {
  constructor() {
    this.volume = 1;
    this.loop = false;
    this.currentTime = 0;
  }
  cloneNode() { return new FakeAudio(); }
  play() { return Promise.resolve(); }
  pause() {}
}

test("AudioManager routes volume through master * bus * sound", async () => {
  globalThis.Audio = FakeAudio;
  const { default: AudioManager } = await import("../src/managers/AudioManager.js");
  const am = new AudioManager({ autoTick: false });
  am.add("a.mp3", "music", { volume: 0.5, bus: "music" });
  const sound = am.getSound("music");

  // master * bus * per-sound volume.
  assert.equal(am._effectiveVolume(sound), 1 * 1 * 0.5);
  am.setBusVolume("music", 0.4);
  assert.ok(Math.abs(am._effectiveVolume(sound) - 0.2) < 1e-9); // 1 * 0.4 * 0.5
  assert.ok(Math.abs(sound.audio.volume - 0.2) < 1e-9, "live element retargeted");
  am.setMasterVolume(0.5);
  assert.ok(Math.abs(am._effectiveVolume(sound) - 0.1) < 1e-9); // 0.5 * 0.4 * 0.5
});

test("AudioManager.fadeTo ramps the fade multiplier over time", async () => {
  globalThis.Audio = FakeAudio;
  const { default: AudioManager } = await import("../src/managers/AudioManager.js");
  const am = new AudioManager({ autoTick: false });
  am.add("m.mp3", "track", { volume: 1, bus: "music" });
  const sound = am.getSound("track");
  sound._fadeMul = 0;

  // 1s into a 2s fade from 0 to 1.
  am.fadeTo("track", 1, 2);
  am.update(1);
  assert.ok(Math.abs(sound._fadeMul - 0.5) < 1e-9, "halfway");
  let done = false;
  am._fades[0].onDone = () => (done = true);
  am.update(1);
  assert.ok(Math.abs(sound._fadeMul - 1) < 1e-9, "complete");
  assert.equal(am._fades.length, 0, "fade removed when done");
});

function mockLocalStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    _map: map,
  };
}

test("Storage.save/load round-trips a versioned envelope", async () => {
  globalThis.localStorage = mockLocalStorage();
  const { default: Storage } = await import("../src/Storage.js");
  assert.equal(Storage.save("slot", { coins: 3 }, { version: 2 }), true);
  assert.deepEqual(Storage.load("slot", { version: 2 }), { coins: 3 });
  assert.equal(Storage.hasSave("slot"), true);
});

test("Storage.load migrates older versions and rewrites", async () => {
  globalThis.localStorage = mockLocalStorage();
  const { default: Storage } = await import("../src/Storage.js");
  Storage.save("p", { hp: 10 }, { version: 1 });
  const data = Storage.load("p", {
    version: 2,
    migrate: (d, from) => ({ ...d, shield: 0, _from: from }),
  });
  assert.deepEqual(data, { hp: 10, shield: 0, _from: 1 });
  assert.deepEqual(Storage.load("p", { version: 2 }), { hp: 10, shield: 0, _from: 1 });
});

test("Storage.load recovers from backup when primary is corrupt", async () => {
  globalThis.localStorage = mockLocalStorage();
  const { default: Storage } = await import("../src/Storage.js");
  // The second save pushes the first value into the backup slot.
  Storage.save("s", { a: 1 }, { version: 1 });
  Storage.save("s", { a: 2 }, { version: 1 });
  globalThis.localStorage.setItem("s", "{not valid json"); // corrupt the primary
  assert.deepEqual(Storage.load("s", { version: 1 }), { a: 1 });
});

test("Storage.load returns fallback for missing key", async () => {
  globalThis.localStorage = mockLocalStorage();
  const { default: Storage } = await import("../src/Storage.js");
  assert.deepEqual(Storage.load("nope", { fallback: { x: 1 } }), { x: 1 });
});

test("CanvasText.wrapText honors newlines and wrap width", async () => {
  const { default: CanvasText } = await import("../src/CanvasText.js");
  // Stub metrics: every character is 10 units wide.
  const measure = (s) => s.length * 10;

  assert.deepEqual(CanvasText.wrapText(measure, "a b c", 0), ["a b c"]); // width 0 disables wrapping
  assert.deepEqual(CanvasText.wrapText(measure, "a\nb", 0), ["a", "b"]);

  // Each word measures 50 or less, so one word fits per 50-wide line.
  assert.deepEqual(CanvasText.wrapText(measure, "hello world foo", 50), [
    "hello",
    "world",
    "foo",
  ]);

  // A single word wider than the limit still gets its own line rather than
  // being broken mid-word.
  assert.deepEqual(CanvasText.wrapText(measure, "tiny enormousword", 50), [
    "tiny",
    "enormousword",
  ]);
});

test("TextureManager retain/release refcounts and drops cache at zero", async () => {
  const { default: TextureManager } = await import("../src/managers/TextureManager.js");
  const path = "test://fake.png";
  const key = `${path}|nearest`;
  TextureManager.textures.set(key, Promise.resolve({ texture: {}, width: 1, height: 1 }));

  TextureManager.retain(path, true);
  TextureManager.retain(path, true);
  assert.equal(TextureManager.refCount(path, true), 2);

  // One release leaves a live reference, so the cache entry survives.
  TextureManager.release(path, true);
  assert.equal(TextureManager.refCount(path, true), 1);
  assert.equal(TextureManager.has(path, true), true);

  // Dropping the last reference evicts it.
  TextureManager.release(path, true);
  assert.equal(TextureManager.refCount(path, true), 0);
  assert.equal(TextureManager.has(path, true), false);

  // Releasing something never retained must not go negative or throw.
  TextureManager.release("test://never.png", true);
  assert.equal(TextureManager.refCount("test://never.png", true), 0);
});

function fakePad(overrides = {}) {
  return {
    index: 0,
    id: overrides.id || "Fake Standard Pad",
    mapping: overrides.mapping ?? "standard",
    buttons: overrides.buttons || [],
    axes: overrides.axes || [0, 0, 0, 0],
  };
}

test("getGamepadAxis rescales past the deadzone (no jump, full range)", () => {
  const input = new InputManager({ target: null, gamepadDeadzone: 0.25 });
  // Deadzone 0.25: 0.2 and 0.25 read as 0, and 0.625 lands exactly halfway
  // through the remaining 0.25..1 band.
  input.gamepads = [fakePad({ axes: [0.2, 0.25, 0.625, 1.0] })];
  assert.equal(input.getGamepadAxis(0), 0);
  assert.equal(input.getGamepadAxis(1), 0);
  assert.ok(Math.abs(input.getGamepadAxis(2) - 0.5) < 1e-9);
  assert.equal(input.getGamepadAxis(3), 1);
});

test("getGamepadStick uses a radial deadzone and preserves direction", () => {
  const input = new InputManager({ target: null, gamepadDeadzone: 0.3 });
  // Each axis is under the 0.3 deadzone, but the diagonal magnitude is ~0.396,
  // so a radial deadzone must let it through.
  input.gamepads = [fakePad({ axes: [0.28, 0.28, 0, 0] })];
  const stick = input.getGamepadStick("left");
  assert.ok(stick.magnitude > 0, "diagonal inside per-axis but outside radial deadzone must register");
  assert.ok(Math.abs(stick.x - stick.y) < 1e-9, "direction preserved");

  // Full deflection still normalizes to exactly 1.
  input.gamepads = [fakePad({ axes: [1, 0, 0, 0] })];
  assert.ok(Math.abs(input.getGamepadStick("left").magnitude - 1) < 1e-9);

  input.gamepads = [fakePad({ axes: [0, -1, 0, 0] })];
  assert.ok(input.getGamepadStick("left", 0, { invertY: true }).y < 0 === false);
});

test("stick direction tokens fire past the press threshold", () => {
  const input = new InputManager({ target: null, gamepadDeadzone: 0.2, stickPressThreshold: 0.5 });
  // Left stick hard up (0.9) clears the 0.5 press threshold; right stick at
  // 0.3 does not.
  input.gamepads = [fakePad({ axes: [0, -0.9, 0.3, 0] })];
  const tokens = input._collectGamepadTokens();
  assert.ok(tokens.has("pad:0:leftStickUp"), "hard up must register");
  assert.ok(!tokens.has("pad:0:leftStickDown"));
  assert.ok(!tokens.has("pad:0:rightStickRight"), "0.3 raw is under the 0.5 press threshold");
});

test("built-in DirectInput profile remaps buttons for known pads", () => {
  const input = new InputManager({ target: null });
  const pressed = (idx, count = 12) =>
    Array.from({ length: count }, (_, i) => ({ pressed: i === idx, value: i === idx ? 1 : 0 }));
  // On this DirectInput pad button 1 is south...
  input.gamepads = [fakePad({ id: "Logitech Dual Action", mapping: "", buttons: pressed(1) })];
  assert.equal(input.getGamepadButton("south").pressed, true);
  assert.equal(input.getGamepadButton("west").pressed, false);
  // ...but on a standard pad the same index is east.
  input.gamepads = [fakePad({ buttons: pressed(1) })];
  assert.equal(input.getGamepadButton("east").pressed, true);
});

test("EmeraldDB resolves envelopes: exact version, migration, fallback", async () => {
  const { default: EmeraldDB } = await import("../src/EmeraldDB.js");

  const exact = EmeraldDB._resolveEnvelope({ v: 2, t: 1, data: { coins: 5 } }, { version: 2 });
  assert.deepEqual(exact, { data: { coins: 5 }, migrated: false });

  const migrated = EmeraldDB._resolveEnvelope(
    { v: 1, t: 1, data: { level: 3 } },
    { version: 2, migrate: (old, from) => ({ ...old, coins: 0, from }) }
  );
  assert.deepEqual(migrated, { data: { level: 3, coins: 0, from: 1 }, migrated: true });

  // Older version with no migrate function: fall back rather than hand back
  // data the caller cannot read.
  const refused = EmeraldDB._resolveEnvelope({ v: 1, t: 1, data: { x: 1 } }, { version: 2, fallback: "F" });
  assert.deepEqual(refused, { data: "F", migrated: false });

  assert.deepEqual(EmeraldDB._resolveEnvelope(null, { fallback: 7 }), { data: 7, migrated: false });
});

test("EmeraldDB wraps plain pre-versioning values as version 0", async () => {
  const { default: EmeraldDB } = await import("../src/EmeraldDB.js");
  // A bare value predates versioning, so it is treated as version 0.
  const env = EmeraldDB._asEnvelope({ legacy: true });
  assert.equal(env.v, 0);
  assert.deepEqual(env.data, { legacy: true });
  // An already-shaped envelope is returned as-is.
  const real = { v: 3, t: 9, data: 1 };
  assert.equal(EmeraldDB._asEnvelope(real), real);
  assert.equal(EmeraldDB._asEnvelope(undefined), null);
});

test("EmeraldDB rejects cleanly where IndexedDB is unavailable", async () => {
  const { default: EmeraldDB } = await import("../src/EmeraldDB.js");
  assert.equal(EmeraldDB.isSupported(), false);
  await assert.rejects(() => EmeraldDB.set("k", 1), /IndexedDB is not available/);
  await assert.rejects(() => EmeraldDB.get("k"), /IndexedDB is not available/);
});
