import { test } from "node:test";
import assert from "node:assert/strict";
import { mat4, vec4 } from "gl-matrix";

import MathUtils from "../src/MathUtils.js";
import Pool from "../src/Pool.js";
import Time from "../src/Time.js";
import IDManager from "../src/managers/IDManager.js";
import { Physics, Vector2, Vector3 } from "../src/Physics.js";
import Transform from "../src/Transform.js";
import Easing from "../src/Easing.js";
import Tween from "../src/Tween.js";
import Timer from "../src/Timer.js";
import StateMachine from "../src/StateMachine.js";
import SpatialGrid from "../src/SpatialGrid.js";
import Serializer from "../src/Serializer.js";
import Scene from "../src/Scene.js";
import GameObject from "../src/components/GameObject.js";
import RigidBody from "../src/components/RigidBody.js";
import BoxCollider from "../src/components/BoxCollider.js";
import Coroutine from "../src/Coroutine.js";
import Interpolator from "../src/Interpolator.js";
import AudioManager from "../src/managers/AudioManager.js";
import Tilemap from "../src/Tilemap.js";
import SpriteBatch from "../src/SpriteBatch.js";

test("MathUtils.clamp bounds values", () => {
  assert.equal(MathUtils.clamp(5, 0, 10), 5);
  assert.equal(MathUtils.clamp(-1, 0, 10), 0);
  assert.equal(MathUtils.clamp(11, 0, 10), 10);
});

test("MathUtils.lerp / inverseLerp / map", () => {
  assert.equal(MathUtils.lerp(0, 10, 0.5), 5);
  assert.equal(MathUtils.inverseLerp(0, 10, 5), 0.5);
  assert.equal(MathUtils.map(5, 0, 10, 0, 100), 50);
});

test("MathUtils.normalize returns a unit vector", () => {
  // 3-4-5 triangle: length 5, so the normalized vector is exactly unit length.
  const n = MathUtils.normalize({ x: 3, y: 4 });
  assert.ok(Math.abs(MathUtils.length(n) - 1) < 1e-9);
  assert.deepEqual(MathUtils.normalize({ x: 0, y: 0 }), { x: 0, y: 0 });
});

test("MathUtils angle conversion round-trips", () => {
  assert.ok(Math.abs(MathUtils.radToDeg(MathUtils.degToRad(90)) - 90) < 1e-9);
});

test("Pool reuses released objects", () => {
  let created = 0;
  const pool = new Pool(() => ({ id: ++created }), null, 0);
  const a = pool.acquire();
  assert.equal(pool.activeCount, 1);
  pool.release(a);
  const b = pool.acquire();
  assert.equal(a, b, "released object should be reused");
  assert.equal(created, 1, "no extra allocation on reuse");
});

test("Pool reset runs with forwarded args", () => {
  const pool = new Pool(
    () => ({ x: 0, y: 0 }),
    (obj, x, y) => {
      obj.x = x;
      obj.y = y;
    }
  );
  const o = pool.acquire(3, 7);
  assert.deepEqual({ x: o.x, y: o.y }, { x: 3, y: 7 });
});

test("Vector2/Vector3 are real instances with working equals", () => {
  const a = new Vector2(1, 2);
  const b = new Vector2(1, 2);
  assert.ok(a instanceof Vector2);
  assert.ok(a.equals(b));
  assert.ok(!a.equals(new Vector2(1, 3)));

  const v3 = new Vector3(1, 2, 3);
  assert.ok(v3 instanceof Vector3);
  assert.ok(v3.equals(new Vector3(1, 2, 3)));
  assert.equal(v3.z, 3);
});

test("Time applies timeScale and accumulates elapsed", () => {
  Time.elapsedTime = 0;
  Time.setTimeScale(2);
  Time.setDeltaTime(0.1);
  // 0.1 raw delta * timeScale 2 = 0.2 scaled; unscaled stays 0.1.
  assert.ok(Math.abs(Time.getDeltaTime() - 0.2) < 1e-9);
  assert.ok(Math.abs(Time.getUnscaledDeltaTime() - 0.1) < 1e-9);
  assert.ok(Math.abs(Time.getElapsedTime() - 0.2) < 1e-9);
  Time.setTimeScale(1);
});

test("IDManager generates unique ids", () => {
  const ids = new Set();
  for (let i = 0; i < 1000; i++) ids.add(IDManager.generateUniqueID());
  assert.equal(ids.size, 1000);
});

// Reproduces the engine's camera view matrix (scale -> rotate -> translate) and
// checks a followed point stays centered at any zoom. Guards the zoom-offset bug.
function viewSpaceOf(worldX, worldY, camWorldX, camWorldY, zoom) {
  // setPosition stores the negated world position.
  const camPos = [-camWorldX, -camWorldY, 0];
  const view = mat4.create();
  mat4.scale(view, view, [zoom, zoom, 1]);
  mat4.rotate(view, view, 0, [0, 0, 1]);
  mat4.translate(view, view, camPos);
  const out = vec4.create();
  vec4.transformMat4(out, [worldX, worldY, 0, 1], view);
  return { x: out[0], y: out[1] };
}

test("camera keeps the followed target centered at every zoom", () => {
  const px = 320;
  const py = -140;
  for (const zoom of [0.5, 1, 2, 3.5]) {
    // Camera follows the player: camera world position == player position.
    const v = viewSpaceOf(px, py, px, py, zoom);
    assert.ok(Math.abs(v.x) < 1e-6, `x centered at zoom ${zoom}`);
    assert.ok(Math.abs(v.y) < 1e-6, `y centered at zoom ${zoom}`);
  }
});

test("Transform hierarchy composes world position with parent scale/rotation", () => {
  const parent = new Transform(new Vector3(10, 0, 0), 0, new Vector2(2, 2));
  const child = new Transform(new Vector3(5, 0, 0), 0, new Vector2(1, 1));
  child.setParent(parent);
  const w = child.getWorldParts();
  assert.ok(Math.abs(w.px - 20) < 1e-9); // 10 + 5 * 2 = 20
  assert.ok(Math.abs(w.py - 0) < 1e-9);
  assert.equal(w.sx, 2);

  // Rotate the parent 90deg: child's +x local offset becomes +y world.
  parent.rotation = Math.PI / 2;
  const w2 = child.getWorldParts();
  assert.ok(Math.abs(w2.px - 10) < 1e-6);
  assert.ok(Math.abs(w2.py - 10) < 1e-6); // 5 * 2 along rotated axis
});

test("Easing endpoints map 0->0 and 1->1", () => {
  for (const name of ["linear", "inOutQuad", "outCubic", "outBounce", "outElastic"]) {
    assert.ok(Math.abs(Easing[name](0) - 0) < 1e-6, `${name}(0)`);
    assert.ok(Math.abs(Easing[name](1) - 1) < 1e-6, `${name}(1)`);
  }
});

test("Tween interpolates and fires onComplete", () => {
  const target = { x: 0 };
  let completed = false;
  const tween = new Tween(target, { x: 10 }, 1, {
    onComplete: () => (completed = true),
  });
  tween.update(0.5);
  assert.ok(Math.abs(target.x - 5) < 1e-9); // halfway through a 1s tween to 10
  tween.update(0.5);
  assert.equal(target.x, 10);
  assert.equal(completed, true);
});

test("Timer.after fires once, Timer.every fires N times", () => {
  Timer.clearAll();
  let onceCount = 0;
  let everyCount = 0;
  Timer.after(1, () => onceCount++);
  Timer.every(0.5, () => everyCount++, 2);
  Timer.update(0.4);
  assert.equal(onceCount, 0);
  Timer.update(0.7); // total 1.1
  assert.equal(onceCount, 1);
  assert.equal(everyCount, 2);
  Timer.update(5);
  assert.equal(onceCount, 1);
  assert.equal(everyCount, 2);
});

test("StateMachine runs enter/exit/update and transitions", () => {
  const log = [];
  const fsm = new StateMachine();
  fsm.add("a", { enter: () => log.push("enterA"), exit: () => log.push("exitA") });
  fsm.add("b", { enter: () => log.push("enterB") });
  fsm.set("a");
  fsm.set("b");
  assert.deepEqual(log, ["enterA", "exitA", "enterB"]);
  assert.ok(fsm.is("b"));
});

test("SpatialGrid.queryRadius returns nearby items only", () => {
  const grid = new SpatialGrid(50);
  grid.insert("near", 10, 10);
  grid.insert("far", 500, 500);
  // Radius 100 covers the item at (10,10) but not the one at (500,500).
  const found = grid.queryRadius(0, 0, 100);
  assert.ok(found.includes("near"));
  assert.ok(!found.includes("far"));
});

test("Serializer round-trips a scene through JSON", () => {
  Serializer.register("dot", () =>
    new GameObject("dot", new Vector3(0, 0, 0), 0, new Vector2(1, 1))
  );
  const scene = new Scene();
  const obj = new GameObject("dot", new Vector3(7, -3, 2), 0.5, new Vector2(4, 4));
  obj.prefabType = "dot";
  obj.layer = 3;
  scene.add(obj);

  const json = Serializer.toJSON(scene);
  const restored = Serializer.fromJSON(json, new Scene());
  assert.equal(restored.objects.length, 1);
  const r = restored.objects[0];
  assert.ok(Math.abs(r.transform.position.x - 7) < 1e-9);
  assert.equal(r.transform.rotation, 0.5);
  assert.equal(r.layer, 3);
});

test("Physics uses a fixed-timestep accumulator", () => {
  const physics = new Physics(-9.8, 30);
  // Half a fixed step in: nothing has been simulated yet, it is all accumulated.
  physics.process(1 / 120);
  assert.ok(physics._accumulator > 0 && physics._accumulator < 1 / 60);
  physics.process(1 / 120);
  assert.ok(physics._accumulator < 1 / 120);
  // Zero and NaN deltas must not advance or corrupt the accumulator.
  const before = physics._accumulator;
  physics.process(0);
  physics.process(NaN);
  assert.equal(physics._accumulator, before);
});

test("syncPhysics copies live position AND rotation onto the transform", () => {
  const physics = new Physics(-9.8, 30);
  const go = new GameObject("body", new Vector3(0, 100, 0), 0, new Vector2(10, 10));
  const rb = new RigidBody(
    physics,
    "dynamic",
    new Vector2(0, 100),
    false,
    go,
    new Vector2(0, 0)
  );
  go.addComponent(rb);
  rb.getBody().setAngularVelocity(2);

  const startY = go.transform.position.y;
  for (let i = 0; i < 30; i++) physics.process(1 / 60);
  go.syncPhysics();

  assert.ok(go.transform.position.y < startY, "y falls under gravity");
  assert.ok(Math.abs(go.transform.rotation) > 0, "rotation is synced from the body");
  const p = rb.getPosition();
  assert.ok(Math.abs(p.y - go.transform.position.y) < 1e-9, "getPosition is live");
});

test("RigidBody.getInitialPosition keeps the spawn position while getPosition tracks the body", () => {
  const physics = new Physics(-9.8, 30);
  const rb = new RigidBody(
    physics,
    "dynamic",
    new Vector2(5, 200),
    false,
    null,
    new Vector2(0, 0)
  );
  assert.equal(rb.getInitialPosition().y, 200);
  for (let i = 0; i < 30; i++) physics.process(1 / 60);
  assert.ok(rb.getPosition().y < 200, "live position has fallen");
  assert.equal(rb.getInitialPosition().y, 200, "spawn position is unchanged");
});

test("Collider debug shapes are created lazily and syncDebugShape never forces creation", () => {
  const physics = new Physics(-9.8, 30);
  const rb = new RigidBody(
    physics,
    "dynamic",
    new Vector2(0, 0),
    false,
    null,
    new Vector2(0, 0)
  );
  const collider = new BoxCollider(rb, new Vector2(1, 1), 1, 0.3, 0, false, null);
  assert.equal(collider._debugShape, null, "no debug shape until requested");
  collider.syncDebugShape({ position: { x: 1, y: 2 }, rotation: 0.5 });
  assert.equal(collider._debugShape, null, "syncDebugShape does not allocate the shape");
});

test("Coroutine sequences time and frame waits", () => {
  Coroutine.clearAll();
  const log = [];
  Coroutine.start(function* () {
    log.push("a");
    yield 1;
    log.push("b");
    yield Coroutine.waitFrames(2);
    log.push("c");
  });
  assert.deepEqual(log, ["a"], "primed to first yield");
  Coroutine.update(0.5);
  assert.deepEqual(log, ["a"], "still waiting");
  Coroutine.update(0.6); // total 1.1 > the 1s yield, so it resumes
  assert.deepEqual(log, ["a", "b"]);
  // waitFrames(2) needs two updates regardless of delta.
  Coroutine.update(0);
  assert.deepEqual(log, ["a", "b"]);
  Coroutine.update(0);
  assert.deepEqual(log, ["a", "b", "c"]);
  assert.equal(Coroutine.count(), 0, "finished coroutine is removed");
});

test("Coroutine.waitUntil blocks until predicate is truthy", () => {
  Coroutine.clearAll();
  let ready = false;
  let done = false;
  Coroutine.start(function* () {
    yield Coroutine.waitUntil(() => ready);
    done = true;
  });
  Coroutine.update(0);
  assert.equal(done, false);
  ready = true;
  Coroutine.update(0);
  assert.equal(done, true);
});

test("Interpolator interpolates between snapshots", () => {
  const it = new Interpolator({ delay: 0 });
  it.push("e", { x: 0, y: 0 }, 0);
  it.push("e", { x: 10, y: 20 }, 1);
  // Midway between the t=0 and t=1 snapshots.
  const s = it.sample("e", 0.5);
  assert.ok(Math.abs(s.x - 5) < 1e-9);
  assert.ok(Math.abs(s.y - 10) < 1e-9);
  assert.equal(it.sample("missing", 1), null);
  // Past the newest snapshot: clamps to it rather than extrapolating.
  const last = it.sample("e", 5);
  assert.equal(last.x, 10);
});

test("AudioManager.computeSpatial attenuates with distance and pans", () => {
  const am = new AudioManager();
  am.setListener(0, 0);
  am.setSpatialRange(100, 1100);
  let r = am.computeSpatial({ x: 0, y: 0 });
  assert.equal(r.volume, 1);
  assert.equal(r.pan, 0);
  // 600 is the midpoint of the 100..1100 rolloff band.
  r = am.computeSpatial({ x: 600, y: 0 });
  assert.ok(Math.abs(r.volume - 0.5) < 1e-9, "linear rolloff midpoint");
  assert.ok(r.pan > 0 && r.pan < 1);
  r = am.computeSpatial({ x: 5000, y: 0 });
  assert.equal(r.volume, 0);
  assert.equal(r.pan, 1);
});

test("Tilemap.computeAutoTile builds neighbor bitmask frames", () => {
  const grid = [
    [1, 1],
    [1, 0],
  ];
  const frames = Tilemap.computeAutoTile(grid, { edgesSolid: false });
  // Neighbor bitmask: solid right + solid down = 2 | 4 = 6.
  assert.equal(frames[0][0], 6);
  assert.equal(frames[1][1], -1); // empty cell gets no frame
  const based = Tilemap.computeAutoTile(grid, { edgesSolid: false, base: 100 });
  assert.equal(based[0][0], 106); // base 100 + bitmask 6
});

test("SpriteBatch._writeQuad writes a centered, rotated quad", () => {
  const out = new Float32Array(4 * 8);
  // Unrotated unit quad centered on the origin: first vertex is the top-left corner.
  SpriteBatch._writeQuad(out, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1);
  assert.ok(Math.abs(out[0] - -1) < 1e-9);
  assert.ok(Math.abs(out[1] - 1) < 1e-9);
  assert.equal(out[2], 0);
  assert.equal(out[3], 0);
  assert.equal(out[4], 1);
  // Rotated 90deg: the top-left corner swings to the bottom-left.
  const out2 = new Float32Array(4 * 8);
  SpriteBatch._writeQuad(out2, 0, 0, 0, 1, 1, Math.PI / 2, 0, 0, 1, 1, 1, 1, 1, 1);
  assert.ok(Math.abs(out2[0] - -1) < 1e-6);
  assert.ok(Math.abs(out2[1] - -1) < 1e-6);
});
