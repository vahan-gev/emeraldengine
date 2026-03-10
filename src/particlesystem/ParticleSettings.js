import { Vector2 } from "../Physics.js";

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
class ParticleSettings {
  constructor({
    lifetime = 1.0,
    velocity = new Vector2(0, 0),
    gravity = new Vector2(0, 0),
    amount = 10,
    direction = new Vector2(1, 0),
    spread = Math.PI / 4,
    emissionRate = Infinity, // particles per second
    frame,
    offset,
    rotation,
    scale,
    animation
  } = {}) {
    this.lifetime = lifetime;
    this.velocity = velocity;
    this.gravity = gravity;
    this.amount = amount;
    this.direction = direction;
    this.spread = spread;
    this.emissionRate = emissionRate;
    this.frame = frame;
    this.offset = offset;
    this.rotation = rotation;
    this.scale = scale;
    this.animation = animation;
  }
}

export default ParticleSettings; 