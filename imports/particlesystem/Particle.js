import Instance from "../Instance.js";

/**
 * @class Particle
 * @description Represents a particle in the particle system
 * @param {InstancedTexture} instancedTexture - The instanced texture
 * @param {Vector3} position - The position of the particle
 * @param {number} rotation - The rotation of the particle
 * @param {Vector2} scale - The scale of the particle
 * @param {ParticleSettings} settings - The settings for the particle
 */
class Particle {
  constructor(instancedTexture, position, rotation, scale, settings) {
    this.settings = settings;
    this.lifetime = settings.lifetime;
    this.age = 0;
    this.velocity = { ...settings.velocity };
    this.gravity = { ...settings.gravity };
    this.instance = new Instance(
      `Particle at ${position.x}, ${position.y}`,
      position,
      scale,
      rotation,
      settings.frame
    );
    this.instancedTexture = instancedTexture;
    if(this.settings.animation) {
      this.instance.playAnimation(
        this.settings.animation.frames,
        this.settings.animation.speed
      );
    }
    instancedTexture.addInstance(this.instance);
  }

  /**
   * @method update
   * @description Updates the particle
   * @param {number} dt - The delta time
   */
  update(dt) {
    this.age += dt;
    // Apply gravity
    this.velocity.x += this.gravity.x * dt;
    this.velocity.y += this.gravity.y * dt;
    // Update position
    this.instance.transform.position.x += this.velocity.x * dt;
    this.instance.transform.position.y += this.velocity.y * dt;
  }

  /**
   * @method isAlive
   * @description Checks if the particle is alive
   * @returns {boolean} - True if the particle is alive
   */
  isAlive() {
    return this.age < this.lifetime;
  }

  /**
   * @method destroy
   * @description Destroys the particle
   */
  destroy() {
    if (this.instancedTexture && this.instance) {
      if (this.instancedTexture.instances.length > 0) {
        if(this.instancedTexture.getInstanceWithId(this.instance.id)) {
          this.instancedTexture.removeInstance(this.instance.id);
        }
      }
    }
  }
}

export default Particle;
