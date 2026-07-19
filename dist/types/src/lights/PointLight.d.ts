export default PointLight;
/**
 * @class PointLight
 * @param {Vector2} position - The position of the light
 * @param {Color} color - The color of the light
 * @param {number} intensity - The intensity of the light
 * @param {number} radius - The radius of the light
 */
declare class PointLight {
    constructor(position: any, color: any, intensity: any, radius: any);
    position: any;
    color: any;
    intensity: any;
    radius: any;
}
