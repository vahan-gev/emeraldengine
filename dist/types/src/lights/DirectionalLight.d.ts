export default DirectionalLight;
/**
 * @class DirectionalLight
 * @param {Vector2} position - The position of the light
 * @param {Vector2} direction - The direction of the light
 * @param {Color} color - The color of the light
 * @param {number} intensity - The intensity of the light
 * @param {number} width - The width of the light
 */
declare class DirectionalLight {
    constructor(position: any, direction: any, color: any, intensity: any, width: any);
    position: any;
    direction: Vector2;
    color: any;
    intensity: any;
    width: any;
    /**
     * Calculate the light intensity at a given point
     * @param {Vector2} point - The point to calculate intensity for
     * @returns {number} - Light intensity (0-1)
     */
    getIntensityAtPoint(point: Vector2): number;
}
import { Vector2 } from "../Physics.js";
