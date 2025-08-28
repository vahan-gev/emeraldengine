import Color from "../Color";
import { Vector2 } from "../Physics";
/**
 * @class DirectionalLight
 * @param {Vector2} position - The position of the light
 * @param {Vector2} direction - The direction of the light
 * @param {Color} color - The color of the light
 * @param {number} intensity - The intensity of the light
 * @param {number} width - The width of the light
 */
declare class DirectionalLight {
    position: Vector2;
    direction: Vector2;
    color: Color;
    intensity: number;
    width: number;
    constructor(position: Vector2, direction: Vector2, color: Color, intensity: number, width: number);
    /**
     * Calculate the light intensity at a given point
     * @param {Vector2} point - The point to calculate intensity for
     * @returns {number} - Light intensity (0-1)
     */
    getIntensityAtPoint(point: Vector2): number;
}
export default DirectionalLight;
//# sourceMappingURL=DirectionalLight.d.ts.map