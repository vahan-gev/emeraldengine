export default Color;
/**
 * @class Color
 * @description Represents a color
 * @param {number} r - The red value
 * @param {number} g - The green value
 * @param {number} b - The blue value
 * @param {number} a - The alpha value
 */
declare class Color {
    constructor(r: any, g: any, b: any, a?: number);
    r: any;
    g: any;
    b: any;
    a: number;
}
