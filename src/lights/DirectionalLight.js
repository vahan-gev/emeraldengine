import { Vector2 } from "../Physics.js";

/**
 * @class DirectionalLight
 * @param {Vector2} position - The position of the light
 * @param {Vector2} direction - The direction of the light
 * @param {Color} color - The color of the light
 * @param {number} intensity - The intensity of the light
 * @param {number} width - The width of the light
 */
class DirectionalLight {
  constructor(position, direction, color, intensity, width) {
    this.position = position; // Vector2 - origin point of the light
    // Normalize the direction vector
    const length = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );
    this.direction = new Vector2(direction.x / length, direction.y / length); // Vector2 - normalized direction vector
    this.color = color; // Color
    this.intensity = intensity; // Number
    this.width = width; // Number - width of the light beam
  }

  /**
   * Calculate the light intensity at a given point
   * @param {Vector2} point - The point to calculate intensity for
   * @returns {number} - Light intensity (0-1)
   */
  getIntensityAtPoint(point) {

    // Calculate distance from light position to point
    const dx = point.x - this.position.x;
    const dy = point.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the projection of the point onto the light direction
    const lightDirNormalized = new Vector2(this.direction.x, this.direction.y);
    const toPoint = new Vector2(dx, dy);
    const projection =
      toPoint.x * lightDirNormalized.x + toPoint.y * lightDirNormalized.y;

    // If point is behind the light, no illumination
    if (projection < 0) {
      return 0;
    }

    // Calculate perpendicular distance from the light beam center
    const perpDistance = Math.abs(
      toPoint.x * lightDirNormalized.y - toPoint.y * lightDirNormalized.x
    );

    // If point is outside the light beam width, no illumination
    if (perpDistance > this.width / 2) {
      return 0;
    }

    // Calculate intensity based on distance within the beam
    const widthFactor = 1 - perpDistance / (this.width / 2);

    // Optional: Add distance attenuation
    const maxDistance = 1000; // Maximum effective distance
    const distanceFactor = Math.max(0, 1 - distance / maxDistance);

    return this.intensity * widthFactor * distanceFactor;
  }
}

export default DirectionalLight;
