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
  constructor(instancedTexture, position, rotation, scale, settings, velocity) {
    this.reset(instancedTexture, position, rotation, scale, settings, velocity);
  }

  /**
   * @method reset
   * @description (Re)initializes the particle. Used by the pool so particle
   * objects can be reused without allocating. `velocity` overrides
   * settings.velocity when provided (avoids a ParticleSettings allocation per
   * particle).
   */
  reset(instancedTexture, position, rotation, scale, settings, velocity) {
    this.settings = settings;
    this.lifetime = settings.lifetime;
    this.age = 0;
    const v = velocity || settings.velocity;
    this.velocity = { x: v.x, y: v.y };
    this.gravity = { x: settings.gravity.x, y: settings.gravity.y };
    this.instance = new Instance(
      `Particle at ${position.x}, ${position.y}`,
      position,
      scale,
      rotation,
      settings.frame
    );
    /** @private */
    this._baseScaleX = scale ? scale.x : 1;
    /** @private */
    this._baseScaleY = scale ? scale.y : 1;

    /** @private */
    this._colFrom = null;
    /** @private */
    this._colTo = null;
    if (settings.colorOverLife) {
      this._colFrom = Particle._normColor(settings.colorOverLife.from);
      this._colTo = Particle._normColor(settings.colorOverLife.to);
    }

    this.instancedTexture = instancedTexture;
    if (this.settings.animation) {
      this.instance.playAnimation(
        this.settings.animation.frames,
        this.settings.animation.speed
      );
    }
    this._applyOverLife(0);
    instancedTexture.addInstance(this.instance);
  }

  /** @private */
  static _normColor(c) {
    if (!c) return [1, 1, 1];
    return [(c.r ?? 255) / 255, (c.g ?? 255) / 255, (c.b ?? 255) / 255];
  }

  /** @private */
  _applyOverLife(t) {
    const s = this.settings;
    const tr = this.instance.transform;

    if (s.scaleOverLife) {
      const m = s.scaleOverLife.from + (s.scaleOverLife.to - s.scaleOverLife.from) * t;
      tr.scale.x = this._baseScaleX * m;
      tr.scale.y = this._baseScaleY * m;
    }

    if (this._colFrom || s.alphaOverLife) {
      let r = 1;
      let g = 1;
      let b = 1;
      let a = 1;
      if (this._colFrom) {
        r = this._colFrom[0] + (this._colTo[0] - this._colFrom[0]) * t;
        g = this._colFrom[1] + (this._colTo[1] - this._colFrom[1]) * t;
        b = this._colFrom[2] + (this._colTo[2] - this._colFrom[2]) * t;
      }
      if (s.alphaOverLife) {
        a = s.alphaOverLife.from + (s.alphaOverLife.to - s.alphaOverLife.from) * t;
      }
      this.instance.setColor(r, g, b, a);
    }
  }

  /**
   * @method update
   * @description Updates the particle
   * @param {number} dt - The delta time
   */
  update(dt) {
    this.age += dt;
    const s = this.settings;

    this.velocity.x += this.gravity.x * dt;
    this.velocity.y += this.gravity.y * dt;
    if (s.drag) {
      const damp = Math.max(0, 1 - s.drag * dt);
      this.velocity.x *= damp;
      this.velocity.y *= damp;
    }
    this.instance.transform.position.x += this.velocity.x * dt;
    this.instance.transform.position.y += this.velocity.y * dt;
    if (s.rotationSpeed) {
      this.instance.transform.rotation += s.rotationSpeed * dt;
    }

    const t = this.lifetime > 0 ? Math.min(1, this.age / this.lifetime) : 1;
    this._applyOverLife(t);
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
