export default ParticleEmitter;
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
declare class ParticleEmitter {
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
    constructor(scene: Scene, options?: {
        texture?: string | HTMLImageElement;
        capacity?: number;
        layer?: number;
        pixelart?: boolean;
        spriteFactory?: Function;
    });
    scene: Scene;
    capacity: number;
    layer: number;
    parts: {
        go: GameObject;
        drawable: any;
        color: Color;
        alive: boolean;
        x: number;
        y: number;
        vx: number;
        vy: number;
        gx: number;
        gy: number;
        drag: number;
        age: number;
        life: number;
        base: number;
        sFrom: number;
        sTo: number;
        aFrom: number;
        aTo: number;
        rot: number;
        rotSpeed: number;
        additive: boolean;
    }[];
    free: {
        go: GameObject;
        drawable: any;
        color: Color;
        alive: boolean;
        x: number;
        y: number;
        vx: number;
        vy: number;
        gx: number;
        gy: number;
        drag: number;
        age: number;
        life: number;
        base: number;
        sFrom: number;
        sTo: number;
        aFrom: number;
        aTo: number;
        rot: number;
        rotSpeed: number;
        additive: boolean;
    }[];
    /**
     * @member activeCount
     * @description Number of particles currently alive.
     */
    get activeCount(): number;
    /**
     * @method emit
     * @description Spawns a single particle. Returns the emitter for chaining.
     * @param {Object} cfg - Spawn config (see class example; all fields optional)
     */
    emit(cfg?: any): this;
    /**
     * @method burst
     * @description Spawns `n` particles with the same config.
     * @param {number} n - How many to spawn
     * @param {Object} cfg - Spawn config
     */
    burst(n: number, cfg?: any): this;
    /** @private */
    private _spawn;
    /**
     * @method update
     * @description Advances and renders every live particle. Call once per frame.
     * @param {number} dt - Seconds since the last frame
     */
    update(dt: number): void;
    /**
     * @method reset
     * @description Kills every live particle immediately (no fade).
     */
    reset(): void;
    /**
     * @method destroy
     * @description Removes every particle GameObject from the scene.
     */
    destroy(): void;
}
import GameObject from "./components/GameObject.js";
import Color from "./Color.js";
