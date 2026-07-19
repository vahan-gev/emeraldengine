/**
 * @class Transform
 * @description Represents a transform with optional parent/child hierarchy.
 * Local position/rotation/scale are composed up the parent chain to produce a
 * world transform. Objects with no parent behave exactly as before (the world
 * transform is the local transform), so existing code is unaffected.
 * @param {Vector3} position - The local position
 * @param {number} rotation - The local rotation (radians)
 * @param {Vector2} scale - The local scale
 */
class Transform {
  constructor(position, rotation, scale) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;

    this.parent = null;
    this.children = [];

    /** @private */
    this._world = {
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
    };
  }

  /**
   * @method setParent
   * @description Sets (or clears) the parent transform, maintaining the
   * children list on both sides.
   * @param {Transform|null} parent - The parent transform, or null to detach
   */
  setParent(parent) {
    if (this.parent === parent) return;
    if (this.parent) {
      const idx = this.parent.children.indexOf(this);
      if (idx !== -1) this.parent.children.splice(idx, 1);
    }
    this.parent = parent || null;
    if (this.parent && this.parent.children.indexOf(this) === -1) {
      this.parent.children.push(this);
    }
  }

  /**
   * @method getWorldParts
   * @description Returns the composed world TRS as primitives. Composition is
   * standard 2D: child local space is scaled and rotated by the parent.
   * @returns {{px:number, py:number, pz:number, rot:number, sx:number, sy:number}}
   */
  getWorldParts() {
    if (!this.parent) {
      return {
        px: this.position.x,
        py: this.position.y,
        pz: this.position.z,
        rot: this.rotation,
        sx: this.scale.x,
        sy: this.scale.y,
      };
    }

    const p = this.parent.getWorldParts();
    const cos = Math.cos(p.rot);
    const sin = Math.sin(p.rot);
    const lx = this.position.x * p.sx;
    const ly = this.position.y * p.sy;

    return {
      px: p.px + (lx * cos - ly * sin),
      py: p.py + (lx * sin + ly * cos),
      pz: p.pz + this.position.z,
      rot: p.rot + this.rotation,
      sx: p.sx * this.scale.x,
      sy: p.sy * this.scale.y,
    };
  }

  /**
   * @method getWorldTransform
   * @description Returns a transform-shaped object ({position, rotation, scale})
   * in world space. The returned object is reused between calls.
   * @returns {{position:{x,y,z}, rotation:number, scale:{x,y}}}
   */
  getWorldTransform() {
    if (!this.parent) return this;
    const w = this.getWorldParts();
    const out = this._world;
    out.position.x = w.px;
    out.position.y = w.py;
    out.position.z = w.pz;
    out.rotation = w.rot;
    out.scale.x = w.sx;
    out.scale.y = w.sy;
    return out;
  }

  /**
   * @method getWorldPosition
   * @description Returns the world-space position as a plain { x, y, z }.
   */
  getWorldPosition() {
    const w = this.getWorldParts();
    return { x: w.px, y: w.py, z: w.pz };
  }

  /**
   * @method equals
   * @description Checks if the transform is equal to another transform
   * @param {Transform} other - The other transform
   * @returns {boolean} - True if the transform is equal to the other transform
   */
  equals(other) {
    if (!other) return false;
    if (!(other instanceof Transform)) return false;
    return (
      this.position.equals(other.position) &&
      this.rotation === other.rotation &&
      this.scale.equals(other.scale)
    );
  }

  /**
   * @method getPosition
   * @description Returns the local position of the transform
   * @returns {Vector3} - The position of the transform
   */
  getPosition() {
    return this.position;
  }

  /**
   * @method getRotation
   * @description Returns the local rotation of the transform
   * @returns {number} - The rotation of the transform
   */
  getRotation() {
    return this.rotation;
  }

  /**
   * @method getScale
   * @description Returns the local scale of the transform
   * @returns {Vector2} - The scale of the transform
   */
  getScale() {
    return this.scale;
  }
}

export default Transform;
