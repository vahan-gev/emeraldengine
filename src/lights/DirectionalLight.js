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
    this.position = position;
    const length = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );
    this.direction = new Vector2(direction.x / length, direction.y / length);
    this.color = color;
    this.intensity = intensity;
    this.width = width;
  }

  /**
   * Calculate the light intensity at a given point
   * @param {Vector2} point - The point to calculate intensity for
   * @returns {number} - Light intensity (0-1)
   */
  getIntensityAtPoint(point) {
    const dx = point.x - this.position.x;
    const dy = point.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const lightDirNormalized = new Vector2(this.direction.x, this.direction.y);
    const toPoint = new Vector2(dx, dy);
    const projection =
      toPoint.x * lightDirNormalized.x + toPoint.y * lightDirNormalized.y;

    if (projection < 0) {
      return 0;
    }

    const perpDistance = Math.abs(
      toPoint.x * lightDirNormalized.y - toPoint.y * lightDirNormalized.x
    );

    if (perpDistance > this.width / 2) {
      return 0;
    }

    const widthFactor = 1 - perpDistance / (this.width / 2);

    const maxDistance = 1000;
    const distanceFactor = Math.max(0, 1 - distance / maxDistance);

    return this.intensity * widthFactor * distanceFactor;
  }
}

export default DirectionalLight;
