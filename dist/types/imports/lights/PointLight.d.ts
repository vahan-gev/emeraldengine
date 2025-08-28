import Color from "../Color";
import { Vector2 } from "../Physics";
/**
 * @class PointLight
 * @param {Vector2} position - The position of the light
 * @param {Color} color - The color of the light
 * @param {number} intensity - The intensity of the light
 * @param {number} radius - The radius of the light
 */
declare class PointLight {
    position: Vector2;
    color: Color;
    intensity: number;
    radius: number;
    constructor(position: Vector2, color: Color, intensity: number, radius: number);
}
export default PointLight;
//# sourceMappingURL=PointLight.d.ts.map