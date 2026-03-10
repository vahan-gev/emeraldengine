import GameObject from "../components/GameObject.js";
import InstancedTexture from "../InstancedTexture.js";
import { Vector3 } from "../Physics.js";
import Particle from "./Particle.js";
import ParticleSettings from "./ParticleSettings.js";

/**
 * @class Particles
 * @description Represents a particle system
 * @param {string} name - The name of the particle system
 * @param {string} texturePath - The path to the texture
 * @param {number} frameWidth - The width of the frame
 * @param {number} frameHeight - The height of the frame
 * @param {number} framesPerRow - The number of frames per row
 * @param {number} totalFrames - The total number of frames
 * @param {number} duration - The duration of the particle system
 * @param {ParticleSettings} settings - The settings for the particle system
 */
export default class Particles {
  constructor(
    name,
    texturePath,
    frameWidth,
    frameHeight,
    framesPerRow,
    totalFrames,
    duration = 0.2,
    settings = null
  ) {
    this.settings = settings
      ? new ParticleSettings(settings)
      : new ParticleSettings();
    this.position = new Vector3(0, 0, 0);
    this.rotation = this.settings.rotation;
    this.scale = this.settings.scale;
    this.particles = [];
    this.duration = duration; // How long the effect lasts in seconds
    this.offset = this.settings.offset; // Distance from center
    this.elapsed = 0;
    this.active = false;
    this.instanceCount = this.settings.amount;
    this.emissionTimer = 0;
    this.emittedParticles = 0;
    this.stopped = false;
    this.gameObject = new GameObject(
      name,
      this.position,
      this.settings.rotation,
      this.settings.scale
    );
    this.instancedTexture = new InstancedTexture(
      texturePath,
      this.instanceCount,
      frameWidth,
      frameHeight,
      framesPerRow,
      totalFrames,
      this.settings.animation ? this.settings.animation.speed : 0,
      this.settings.animation ? true : false,
    );
    this.instancedTexture.clearInstances(); // Ensure clean state on creation
    this.gameObject.addComponent(this.instancedTexture);
    
    // Initialize clean state
    this.particles = [];
    this.active = false;
    this.elapsed = 0;
    this.emissionTimer = 0;
    this.emittedParticles = 0;
    this.stopped = false;
  }

  /**
   * @method play
   * @description Plays the particle system
   * @param {Vector3} newPosition - The position to play the particle system at
   */
  play(newPosition) {
    this.instancedTexture.clearInstances();
    this.particles = [];
    this.elapsed = 0;
    this.active = true;
    this.emissionTimer = 0;
    this.emittedParticles = 0;
    this.stopped = false;
    this.lastEmitPosition = newPosition;
    if (this.settings.emissionRate === Infinity) {
      // One-shot: emit all at once
      this.emitParticles(this.settings.amount, newPosition);
    }
    // For continuous, particles will be emitted in update()
  }

  /**
   * @method emitParticles
   * @description Emits particles
   * @param {number} count - The number of particles to emit
   * @param {Vector3} position - The position to emit the particles at
   */
  emitParticles(count, position) {
    const numberOfParticles = count;
    const baseDirection = this.settings.direction;
    const baseVelocity = this.settings.velocity;
    const speed = Math.sqrt(
      baseVelocity.x * baseVelocity.x + baseVelocity.y * baseVelocity.y
    );
    for (let i = 0; i < numberOfParticles; i++) {
      let angle = Math.atan2(baseDirection.y, baseDirection.x);
      let spread = this.settings.spread;
      const angleVariation = (Math.random() - 0.5) * spread;
      const finalAngle = angle + angleVariation;
      const velocity = {
        x: Math.cos(finalAngle) * speed,
        y: Math.sin(finalAngle) * speed,
      };
      const offsetVariation = (Math.random() - 0.5) * this.offset * 0.5;
      const pos = new Vector3(
        position.x + Math.cos(finalAngle) * (this.offset + offsetVariation),
        position.y + Math.sin(finalAngle) * (this.offset + offsetVariation),
        position.z
      );
      const particleSettings = new ParticleSettings({
        ...this.settings,
        velocity,
      });
      if(this.particles.length < this.instanceCount) {
        let particle = new Particle(
          this.instancedTexture,
          pos,
          this.rotation,
          this.scale,
          particleSettings
        );
        this.particles.push(particle);
      }
      
    }
  }

  /**
   * @method update
   * @description Updates the particle system
   * @param {number} deltaTime - The delta time
   */
  update(deltaTime) {
    if (!this.active || this.stopped) return;
    this.elapsed += deltaTime;
    // Continuous emission
    if (
      this.settings.emissionRate !== Infinity &&
      this.elapsed <= this.duration
    ) {
      this.emissionTimer += deltaTime;
      const particlesPerSecond = this.settings.emissionRate;
      let toEmit = 0;
      if (particlesPerSecond > 0) {
        const expectedTotal = Math.floor(
          this.emissionTimer * particlesPerSecond
        );
        toEmit = expectedTotal - this.emittedParticles;
      }
      if (toEmit > 0) {
        this.emitParticles(toEmit, this.lastEmitPosition);
        this.emittedParticles += toEmit;
      }
    }
    // Update all particles and remove dead ones
    this.particles = this.particles.filter((particle) => {
      particle.update(deltaTime);
      if (!particle.isAlive()) {
        particle.destroy();
        return false;
      }
      return true;
    });
    if (
      this.elapsed >= this.duration &&
      this.settings.emissionRate !== Infinity
    ) {
      this.stopped = true;
    }
    if (this.stopped && this.particles.length === 0) {
      this.instancedTexture.clearInstances();
      this.particles = [];
      this.active = false;
    }
  }

  /**
   * @method stop
   * @description Stops the particle system
   */
  stop() {
    this.stopped = true;
    this.instancedTexture.clearInstances();
    this.particles = [];
    this.active = false;
  }

  /**
   * @method destroy
   * @description Destroys the particle system
   */
  destroy() {
    this.stop();
    if (this.instancedTexture) {
      this.instancedTexture.clearInstances();
    }
    this.particles = [];
    this.active = false;
  }

  /**
   * @method reset
   * @description Resets the particle system
   */
  reset() {
    this.stop();
    this.particles = [];
    this.active = false;
    this.elapsed = 0;
    this.emissionTimer = 0;
    this.emittedParticles = 0;
    this.stopped = false;
  }
}
