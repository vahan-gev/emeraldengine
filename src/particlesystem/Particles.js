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
    this.duration = duration;
    this.offset = this.settings.offset;
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
    this.instancedTexture.clearInstances();
    this.gameObject.addComponent(this.instancedTexture);

    /** @private */
    this._pool = [];

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
      this.emitParticles(this.settings.amount, newPosition);
    }
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
      const spawn = this._spawnOffset(finalAngle);
      const pos = new Vector3(
        position.x + spawn.x,
        position.y + spawn.y,
        position.z
      );
      if (this.particles.length < this.instanceCount) {
        let particle = this._pool.pop();
        if (particle) {
          particle.reset(
            this.instancedTexture,
            pos,
            this.rotation,
            this.scale,
            this.settings,
            velocity
          );
        } else {
          particle = new Particle(
            this.instancedTexture,
            pos,
            this.rotation,
            this.scale,
            this.settings,
            velocity
          );
        }
        this.particles.push(particle);
      }
    }
  }

  /**
   * @method _spawnOffset
   * @description Returns a spawn offset { x, y } from the emitter center based on
   * the configured emitter shape.
   * @param {number} finalAngle - The chosen emission angle (for the cone shape)
   * @private
   */
  _spawnOffset(finalAngle) {
    const s = this.settings;
    const radius = s.shapeRadius || 0;
    switch (s.shape) {
      case "point":
        return { x: 0, y: 0 };
      case "circle": {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      }
      case "ring": {
        const a = Math.random() * Math.PI * 2;
        return { x: Math.cos(a) * radius, y: Math.sin(a) * radius };
      }
      case "box": {
        const w = s.shapeSize ? s.shapeSize.x : 0;
        const h = s.shapeSize ? s.shapeSize.y : 0;
        return {
          x: (Math.random() - 0.5) * w,
          y: (Math.random() - 0.5) * h,
        };
      }
      case "cone":
      default: {
        const baseOffset = this.offset || 0;
        const offsetVariation = (Math.random() - 0.5) * baseOffset * 0.5;
        const dist = baseOffset + offsetVariation;
        return {
          x: Math.cos(finalAngle) * dist,
          y: Math.sin(finalAngle) * dist,
        };
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
    this.particles = this.particles.filter((particle) => {
      particle.update(deltaTime);
      if (!particle.isAlive()) {
        particle.destroy();
        this._pool.push(particle);
        return false;
      }
      return true;
    });
    const pastDuration = this.elapsed >= this.duration;
    if (pastDuration && this.settings.emissionRate !== Infinity) {
      this.stopped = true;
    }
    if ((this.stopped || pastDuration) && this.particles.length === 0) {
      this.instancedTexture.clearInstances();
      this.particles = [];
      this.active = false;
      this.stopped = true;
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
