export default ParticleSettings;
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
    constructor({ lifetime, velocity, gravity, amount, direction, spread, emissionRate, frame, offset, rotation, scale, animation, shape, shapeRadius, shapeSize, scaleOverLife, alphaOverLife, colorOverLife, rotationSpeed, drag, }?: {
        lifetime?: number;
        velocity?: Vector2;
        gravity?: Vector2;
        amount?: number;
        direction?: Vector2;
        spread?: number;
        emissionRate?: number;
        shape?: string;
        shapeRadius?: number;
        shapeSize?: Vector2;
        scaleOverLife?: any;
        alphaOverLife?: any;
        colorOverLife?: any;
        rotationSpeed?: number;
        drag?: number;
    });
    lifetime: number;
    velocity: Vector2;
    gravity: Vector2;
    amount: number;
    direction: Vector2;
    spread: number;
    emissionRate: number;
    frame: any;
    offset: any;
    rotation: any;
    scale: any;
    animation: any;
    shape: string;
    shapeRadius: number;
    shapeSize: Vector2;
    scaleOverLife: any;
    alphaOverLife: any;
    colorOverLife: any;
    rotationSpeed: number;
    drag: number;
}
import { Vector2 } from "../Physics.js";
