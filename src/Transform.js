/**
 * @class Transform
 * @description Represents a transform
 * @param {Vector3} position - The position of the transform
 * @param {number} rotation - The rotation of the transform
 * @param {Vector2} scale - The scale of the transform
 */
class Transform {
  constructor(position, rotation, scale) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
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
   * @description Returns the position of the transform
   * @returns {Vector3} - The position of the transform
   */
  getPosition() {
    return this.position;
  }

  /**
   * @method getRotation
   * @description Returns the rotation of the transform
   * @returns {number} - The rotation of the transform
   */
  getRotation() {
    return this.rotation;
  }

  /**
   * @method getScale
   * @description Returns the scale of the transform
   * @returns {Vector2} - The scale of the transform
   */
  getScale() {
    return this.scale;
  }
}

export default Transform;
