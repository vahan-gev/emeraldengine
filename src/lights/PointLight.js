/**
 * @class PointLight
 * @param {Vector2} position - The position of the light
 * @param {Color} color - The color of the light
 * @param {number} intensity - The intensity of the light
 * @param {number} radius - The radius of the light
 */
class PointLight {
  constructor(position, color, intensity, radius) {
    this.position = position; // Vector2
    this.color = color; // Color
    this.intensity = intensity; // Number
    this.radius = radius; // Number
  }
}

export default PointLight;
