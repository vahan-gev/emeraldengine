import GameObject from "./components/GameObject.js";
import Texture from "./Texture.js";
import Color from "./Color.js";
import { Vector2, Vector3 } from "./Physics.js";

const DEFAULT_CAPACITY = 256;
const PARK_Y = -1e9;

/**
 * @class ParticleEmitter
 * @description A reliable, allocation-free particle system built from a fixed
 * pool of ordinary textured GameObjects. Each live particle's transform, tint
 * and opacity are driven by hand every frame — there is no instanced-draw /
 * dynamic-buffer lifecycle to desync, so it keeps drawing for the whole session
 * (unlike the InstancedTexture-based `Particles`, which can stop emitting after
 * heavy reuse on some GPUs).
 *
 * Spawn with `burst(n, cfg)` or `emit(cfg)`; advance with `update(dt)` once per
 * frame. Every `cfg` field is optional and has a sensible default, so the
 * minimal call is `emitter.burst(8, { x, y })`.
 *
 * @example
 * const fx = new ParticleEmitter(scene, { texture: smokeImg, layer: 50 });
 * fx.burst(12, {
 *   x: 100, y: 200, dir: -Math.PI / 2, spread: Math.PI, speed: 180,
 *   gy: -300, drag: 2, life: 0.4, size: 8, sFrom: 1, sTo: 0.1,
 *   aFrom: 0.7, aTo: 0, cr: 255, cg: 220, cb: 120, additive: true,
 *   shape: "circle", radius: 6,
 * });
 * // in the loop: fx.update(dt);
 */
class ParticleEmitter {
  /**
   * @param {Scene} scene - Scene the particle GameObjects are added to
   * @param {Object} [options]
   * @param {string|HTMLImageElement} [options.texture] - Particle sprite source
   * @param {number} [options.capacity=256] - Pool size (max live particles)
   * @param {number} [options.layer=0] - Render layer for every particle
   * @param {boolean} [options.pixelart=false] - Pixel-art sampling for the sprite
   * @param {Function} [options.spriteFactory] - `(texture, options) => Drawable`
   *   override used to build each particle's drawable (handy for tests / custom
   *   shaders). Defaults to a non-lit `Texture`.
   */
  constructor(scene, options = {}) {
    this.scene = scene;
    this.capacity = options.capacity ?? DEFAULT_CAPACITY;
    this.layer = options.layer ?? 0;

    const texture = options.texture ?? options.texturePath ?? null;
    const makeSprite =
      options.spriteFactory ||
      ((tex) => new Texture(tex, 0, 0, 1, 1, 0, false, options.pixelart ?? false, false));

    this.parts = [];
    this.free = [];

    for (let i = 0; i < this.capacity; i++) {
      const go = new GameObject(
        "particle",
        new Vector3(0, PARK_Y, 0),
        0,
        new Vector2(4, 4)
      );
      const drawable = makeSprite(texture, options);
      if (drawable && typeof drawable.setUseLighting === "function") {
        drawable.setUseLighting(false);
      }
      go.addComponent(drawable);
      go.setLayer(this.layer);
      go.setOpacity(0);
      if (scene && typeof scene.add === "function") scene.add(go);

      const p = {
        go,
        drawable,
        color: new Color(255, 255, 255, 255),
        alive: false,
        x: 0, y: 0, vx: 0, vy: 0, gx: 0, gy: 0, drag: 0,
        age: 0, life: 1, base: 4,
        sFrom: 1, sTo: 1, aFrom: 1, aTo: 0,
        rot: 0, rotSpeed: 0, additive: false,
      };
      this.parts.push(p);
      this.free.push(p);
    }
  }

  /**
   * @member activeCount
   * @description Number of particles currently alive.
   */
  get activeCount() {
    return this.capacity - this.free.length;
  }

  /**
   * @method emit
   * @description Spawns a single particle. Returns the emitter for chaining.
   * @param {Object} cfg - Spawn config (see class example; all fields optional)
   */
  emit(cfg = {}) {
    this._spawn(cfg);
    return this;
  }

  /**
   * @method burst
   * @description Spawns `n` particles with the same config.
   * @param {number} n - How many to spawn
   * @param {Object} cfg - Spawn config
   */
  burst(n, cfg = {}) {
    for (let i = 0; i < n; i++) this._spawn(cfg);
    return this;
  }

  /** @private */
  _spawn(cfg) {
    const p = this.free.pop();
    if (!p) return;

    p.alive = true;

    const x = cfg.x || 0;
    const y = cfg.y || 0;
    let ox = 0;
    let oy = 0;
    const shape = cfg.shape;
    if (shape === "ring") {
      const a = Math.random() * Math.PI * 2;
      const r = cfg.radius || 0;
      ox = Math.cos(a) * r;
      oy = Math.sin(a) * r;
    } else if (shape === "circle") {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * (cfg.radius || 0);
      ox = Math.cos(a) * r;
      oy = Math.sin(a) * r;
    } else if (shape === "box") {
      ox = (Math.random() - 0.5) * (cfg.boxw || 0);
      oy = (Math.random() - 0.5) * (cfg.boxh || 0);
    }
    p.x = x + ox;
    p.y = y + oy;

    const dir = cfg.dir || 0;
    const spread = cfg.spread || 0;
    const speed = cfg.speed || 0;
    const ang = dir + (Math.random() - 0.5) * spread;
    const spd = speed * (0.6 + Math.random() * 0.4);
    p.vx = Math.cos(ang) * spd;
    p.vy = Math.sin(ang) * spd;

    p.gx = cfg.gx || 0;
    p.gy = cfg.gy || 0;
    p.drag = cfg.drag || 0;
    p.age = 0;
    p.life = cfg.life || 0.5;
    p.base = cfg.size ?? 6;
    p.sFrom = cfg.sFrom ?? 1;
    p.sTo = cfg.sTo ?? 0;
    p.aFrom = cfg.aFrom ?? 1;
    p.aTo = cfg.aTo ?? 0;
    p.rot = cfg.rot ?? Math.random() * Math.PI * 2;
    p.rotSpeed = cfg.rotSpeed || 0;

    p.color.r = cfg.cr ?? 255;
    p.color.g = cfg.cg ?? 255;
    p.color.b = cfg.cb ?? 255;
    p.color.a = 255;
    if (p.drawable) {
      if (typeof p.drawable.setColor === "function") p.drawable.setColor(p.color);
      if (typeof p.drawable.setBlendMode === "function") {
        p.drawable.setBlendMode(cfg.additive ? "additive" : "normal");
      }
    }

    const tr = p.go.transform;
    tr.position.x = p.x;
    tr.position.y = p.y;
    tr.scale.x = p.base * p.sFrom;
    tr.scale.y = p.base * p.sFrom;
    tr.rotation = p.rot;
    p.go.setOpacity(p.aFrom);
  }

  /**
   * @method update
   * @description Advances and renders every live particle. Call once per frame.
   * @param {number} dt - Seconds since the last frame
   */
  update(dt) {
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      if (!p.alive) continue;

      p.age += dt;
      if (p.age >= p.life) {
        p.alive = false;
        p.go.setOpacity(0);
        p.go.transform.position.y = PARK_Y;
        this.free.push(p);
        continue;
      }

      const t = p.age / p.life;
      p.vx += p.gx * dt;
      p.vy += p.gy * dt;
      if (p.drag) {
        const d = Math.max(0, 1 - p.drag * dt);
        p.vx *= d;
        p.vy *= d;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.rotSpeed * dt;

      const sc = p.base * (p.sFrom + (p.sTo - p.sFrom) * t);
      const tr = p.go.transform;
      tr.position.x = p.x;
      tr.position.y = p.y;
      tr.scale.x = sc;
      tr.scale.y = sc;
      tr.rotation = p.rot;
      p.go.setOpacity(p.aFrom + (p.aTo - p.aFrom) * t);
    }
  }

  /**
   * @method reset
   * @description Kills every live particle immediately (no fade).
   */
  reset() {
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      if (!p.alive) continue;
      p.alive = false;
      p.go.setOpacity(0);
      p.go.transform.position.y = PARK_Y;
    }
    this.free = this.parts.slice();
  }

  /**
   * @method destroy
   * @description Removes every particle GameObject from the scene.
   */
  destroy() {
    if (this.scene && typeof this.scene.remove === "function") {
      for (let i = 0; i < this.parts.length; i++) {
        this.scene.remove(this.parts[i].go);
      }
    }
    this.parts = [];
    this.free = [];
  }
}

export default ParticleEmitter;
