/**
 * @class PointLight
 * @param {Vector2} position - The position of the light
 * @param {Color} color - The color of the light
 * @param {number} intensity - The intensity of the light
 * @param {number} radius - The radius of the light
 */
class PointLight {
  constructor(position, color, intensity, radius) {
    this.position = position;
    this.color = color;
    this.intensity = intensity;
    this.radius = radius;
  }
}

export default PointLight;
