import { Vector2 } from "../Physics";
interface ParticleSettingsConfig {
    lifetime?: number;
    velocity?: Vector2;
    gravity?: Vector2;
    amount?: number;
    direction?: Vector2;
    spread?: number;
    emissionRate?: number;
    frame?: number;
    offset?: number;
    rotation?: number;
    scale?: Vector2;
    animation?: any;
}
/**
 * @class ParticleSettings
 * @description Represents the settings for a particle system
 * @param {number} lifetime - The lifetime of the particle
 * @param {Vector2} velocity - The velocity of the particle
 * @param {Vector2} gravity - The gravity of the particle
 * @param {number} amount - The amount of particles
 * @param {Vector2} direction - The direction of the particle
 * @param {number} spread - The spread of the particle
 * @param {number} emissionRate - The emission rate of the particle
 * @param {number} frame - The frame of the particle
 * @param {number} offset - The offset of the particle
 * @param {number} rotation - The rotation of the particle
 * @param {Vector2} scale - The scale of the particle
 * @param {Array} animation - The animation of the particle
 */
declare class ParticleSettings {
    lifetime: number;
    velocity: Vector2;
    gravity: Vector2;
    amount: number;
    direction: Vector2;
    spread: number;
    emissionRate: number;
    frame?: number;
    offset?: number;
    rotation?: number;
    scale?: Vector2;
    animation?: any;
    constructor({ lifetime, velocity, gravity, amount, direction, spread, emissionRate, // particles per second
    frame, offset, rotation, scale, animation }?: ParticleSettingsConfig);
}
export default ParticleSettings;
//# sourceMappingURL=ParticleSettings.d.ts.map