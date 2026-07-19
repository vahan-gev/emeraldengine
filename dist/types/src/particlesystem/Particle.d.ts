export default Particle;
/**
 * @class Particle
 * @description Represents a particle in the particle system
 * @param {InstancedTexture} instancedTexture - The instanced texture
 * @param {Vector3} position - The position of the particle
 * @param {number} rotation - The rotation of the particle
 * @param {Vector2} scale - The scale of the particle
 * @param {ParticleSettings} settings - The settings for the particle
 */
declare class Particle {
    /** @private */
    private static _normColor;
    constructor(instancedTexture: any, position: any, rotation: any, scale: any, settings: any, velocity: any);
    /**
     * @method reset
     * @description (Re)initializes the particle. Used by the pool so particle
     * objects can be reused without allocating. `velocity` overrides
     * settings.velocity when provided (avoids a ParticleSettings allocation per
     * particle).
     */
    reset(instancedTexture: any, position: any, rotation: any, scale: any, settings: any, velocity: any): void;
    settings: any;
    lifetime: any;
    age: number;
    velocity: {
        x: any;
        y: any;
    };
    gravity: {
        x: any;
        y: any;
    };
    instance: Instance;
    /** @private */
    private _baseScaleX;
    /** @private */
    private _baseScaleY;
    /** @private */
    private _colFrom;
    /** @private */
    private _colTo;
    instancedTexture: any;
    /** @private */
    private _applyOverLife;
    /**
     * @method update
     * @description Updates the particle
     * @param {number} dt - The delta time
     */
    update(dt: number): void;
    /**
     * @method isAlive
     * @description Checks if the particle is alive
     * @returns {boolean} - True if the particle is alive
     */
    isAlive(): boolean;
    /**
     * @method destroy
     * @description Destroys the particle
     */
    destroy(): void;
}
import Instance from "../Instance.js";
