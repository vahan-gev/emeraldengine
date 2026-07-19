# Getting Started with Emerald

A practical walkthrough that takes you from an empty page to a small game:
a player sprite you can move with keyboard **or gamepad**, tiles to stand on,
sound, saving, and a debug overlay to keep you honest. Every snippet uses real
engine APIs — copy them as-is.

For the full API surface see the [README](../README.md); for the level editor
see [Emerald Tile Forge](../../emerald-tile-forge/README.md).

## 1. Setup

```html
<canvas id="game"></canvas>
<script type="module" src="./main.js"></script>
```

```js
import { Emerald, Scene, Color, InputManager } from "emeraldengine";

const canvas = document.getElementById("game");
const emerald = new Emerald(canvas);          // WebGL2 context + default camera
emerald.setBackgroundColor(new Color(30, 34, 50, 255));

const scene = new Scene();
const input = new InputManager();

function resize() {
  emerald.resize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", resize);
resize();

emerald.run((dt) => {
  scene.update(dt);              // ticks Behaviours, physics sync, animations
  emerald.drawScene(scene, dt);  // renders all cameras (+ post effects)
  input.update();                // advances justPressed/justReleased edges
});
```

`run()` also accepts options: `{ pauseOnBlur: true, fixedStep: 1/60, fixedUpdate }`
for background-tab pausing and fixed-timestep physics.

## 2. A sprite with animation

> **About the asset paths.** `assets/hero.png`, `assets/tiles.png` and the audio
> files below are placeholders — point them at your own files. Loading is
> asynchronous, so a missing file never stops your game: the object just renders
> nothing and the console logs
> `Could not initialize texture "assets/hero.png"`. If a sprite is invisible,
> check that path first. The frame numbers assume a 16x16 spritesheet with 8
> frames per row — match them to your own sheet.

```js
import { GameObject, Texture, Animator, Vector2, Vector3 } from "emeraldengine";

const player = new GameObject("player", new Vector3(0, 0, 0), 0, new Vector2(48, 48));
// (path, frameW, frameH, framesPerRow, totalFrames, msPerFrame, autoPlay, pixelart, useLighting)
const tex = new Texture("assets/hero.png", 16, 16, 8, 32, 120, false, true, false);
player.addComponent(tex);

const anim = new Animator();
anim.addClip("idle", [0, 1], { speed: 300 });
anim.addClip("run", [8, 9, 10, 11], { speed: 90 });
player.addComponent(anim);
anim.play("idle");

scene.add(player);
```

Flip with `tex.setFlipX(true)` — never by negating scale. Frame UVs are
automatically inset half a texel, so spritesheet frames never bleed into their
neighbors (no white seams).

### Pixel-art checklist

- Pass `pixelart: true` on textures (NEAREST filtering + whole-pixel positions).
- Snap the camera: `emerald.camera.setPixelSnap(true)` — kills sub-pixel
  shimmer while a smooth-follow camera moves. The stored position stays
  smooth; only the rendered position rounds.

## 3. Input: keyboard + every kind of gamepad

Bind *actions* once; read actions everywhere. Keyboard keys, mouse buttons,
gamepad buttons, and even analog stick directions are all just tokens:

```js
input
  .mapAction("left",  ["a", "ArrowLeft",  "pad:0:dpadLeft",  "pad:0:leftStickLeft"])
  .mapAction("right", ["d", "ArrowRight", "pad:0:dpadRight", "pad:0:leftStickRight"])
  .mapAction("jump",  [" ", "w", "pad:0:south"]);

// in the loop:
const dir = input.getAxis("left", "right");    // -1 | 0 | +1
if (input.justPressed("jump")) jump();

// full analog, radial deadzone (diagonals not clipped), rescaled to 0..1:
const stick = input.getGamepadStick("left", 0, { invertY: true });
velocity.x = stick.x * speed;                   // stick.magnitude, stick.angle also available
```

- `"pad:0:south"` is the bottom face button on *any* controller — Xbox,
  PlayStation and DirectInput layouts all resolve through mappings.
  Common DirectInput pads (Logitech Dual Action, Twin USB adapters, 8BitDo)
  are recognized out of the box; add your own with
  `InputManager.registerGamepadMapping("mypad", { buttons: { south: 1 } })`.
- Deadzone/feel: `input.setGamepadDeadzone(0.25)` and
  `input.setGamepadCurve(2)` (finer control near center).
- Rumble: `input.rumble(0, { duration: 120 })`.

## 4. Tiles and levels

For hand-built levels use the [Tile Forge editor](../../emerald-tile-forge/)
and its `EmeraldLevelLoader` (slices spritesheets, paints layers with parallax,
entities, per-tile polygon colliders — and renders all static tiles as **one
draw call per tileset**). For procedural grids use the engine's `Tilemap`:

```js
import { Tilemap, Physics } from "emeraldengine";

// (name, texturePath, options)
const map = new Tilemap("ground", "assets/tiles.png", {
  tileSize: 32, frameWidth: 16, frameHeight: 16, framesPerRow: 4, totalFrames: 16,
});

map.setMap(grid2D);            // rows of frame indices (-1 or null = empty)
scene.add(map.gameObject);     // every tile lives on one GameObject

const physics = new Physics(-9.8, 30);
map.buildColliders(physics);   // static bodies for solid cells, merged into runs
```

`TiledMap` and `Aseprite` importers are available for external tools.

## 5. Sound

```js
import { AudioManager } from "emeraldengine";
const audio = new AudioManager();
audio.add("assets/jump.wav", "jump", { bus: "sfx" });
audio.add("assets/theme.mp3", "theme", { bus: "music", loop: true });

audio.play("jump");
audio.fadeIn("theme", 1.5);
audio.setBusVolume("music", 0.6);       // mix buses: master * bus * sound
audio.crossfade("theme", "boss", 2.0);  // level transition
```

## 6. Saving

```js
import { Storage } from "emeraldengine";

Storage.save("save1", { level: 3, coins: 120 }, { version: 2, backup: true });

const data = Storage.load("save1", {
  version: 2,
  fallback: { level: 1, coins: 0 },
  migrate: (old, fromVersion) => ({ ...old, coins: old.coins ?? 0 }),
});
```

Writes are versioned envelopes with a `.bak` mirror — a corrupted write
recovers from backup automatically.

For **large saves** (a persistent world, not just settings), use `EmeraldDB` —
the async IndexedDB twin with the same API and no 5MB localStorage cap:

```js
import { EmeraldDB } from "emeraldengine";
await EmeraldDB.save("world", world, { version: 1 });
const world = await EmeraldDB.load("world", { version: 1, fallback: newWorld() });
```

## 7. Post-processing

```js
import { PostEffects } from "emeraldengine";
emerald.addPostEffect(PostEffects.bloom({ threshold: 0.85, intensity: 0.65 }));
```

Bloom over your HUD makes text mushy, so render UI on its own camera and take
it out of the post-processing pass. Put UI objects on their own layer, give the
camera that layer, and exclude it:

```js
import { Camera } from "emeraldengine";

const UI_LAYER = 1;
healthBar.layer = UI_LAYER;        // any GameObject that belongs to the HUD

const uiCamera = new Camera();
uiCamera.setOnlyLayers([UI_LAYER]);   // draws nothing but the HUD
uiCamera.setExcludeFromPost(true);    // and skips bloom/vignette/colorGrade
emerald.addCamera(uiCamera);

emerald.camera.setIgnoreLayers([UI_LAYER]);  // keep the world camera off the HUD
```

## 8. Cleaning up (do this, it matters)

Removing an object from a scene does **not** free its GPU memory — that's
deliberate, so you can re-add it. When something is gone for good:

```js
scene.remove(enemy, { dispose: true });  // frees GL buffers + texture refs
// or when tearing down a whole level/screen:
scene.dispose();
```

Shared textures are reference-counted: the GL texture is deleted when the last
user disposes. Skipping this leaks GPU memory across level restarts.

WebGL context loss (mobile tab switches, GPU resets) is handled automatically —
rendering pauses and every texture, buffer, shader, and render target is
rebuilt on restore. Hook `emerald.onContextLost(cb)` / `onContextRestored(cb)`
to show an overlay if you want.

## 9. Watching performance

```js
import { DebugOverlay } from "emeraldengine";
const debug = new DebugOverlay();
// after drawScene each frame:
debug.update(emerald, scene);
```

The overlay shows FPS, frame-time graph, and the render counters —
`draws` (GPU draw calls), `quads` (sprites drawn, counting batched instances),
`binds` (texture switches). Programmatic access: `emerald.getRenderStats()`.
If `draws` grows with your level size, something isn't batched — reach for
`Tilemap`, `SpriteBatch`, or the level loader's instanced path.

## Where to go next

- **README** — full reference for every system (materials, particles,
  networking, coroutines, tweens, state machines...).
- **Emerald Tile Forge** — the editor for hand-built levels, tilesets,
  per-tile colliders and entity placement.
