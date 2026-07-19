export default MathUtils;
/**
 * @class MathUtils
 * @description Common math helpers for games: interpolation, clamping, angle
 * conversion, random ranges, and lightweight 2D vector operations that work on
 * any `{ x, y }` object (including planck Vec2 and Emerald Vector2).
 */
declare class MathUtils {
    /**
     * Clamps a value to the [min, max] range.
     */
    static clamp(value: any, min: any, max: any): any;
    /**
     * Linearly interpolates between a and b by t (t is not clamped).
     */
    static lerp(a: any, b: any, t: any): any;
    /**
     * Inverse lerp: returns the t for which lerp(a, b, t) === value.
     */
    static inverseLerp(a: any, b: any, value: any): number;
    /**
     * Remaps a value from one range to another.
     */
    static map(value: any, inMin: any, inMax: any, outMin: any, outMax: any): any;
    /**
     * Converts degrees to radians.
     */
    static degToRad(degrees: any): number;
    /**
     * Converts radians to degrees.
     */
    static radToDeg(radians: any): number;
    /**
     * Returns a random float in [min, max).
     */
    static randomRange(min: any, max: any): any;
    /**
     * Returns a random integer in [min, max] (inclusive).
     */
    static randomInt(min: any, max: any): number;
    /**
     * Returns a random element of an array (or undefined if empty).
     */
    static randomChoice(array: any): any;
    /**
     * Euclidean distance between two `{ x, y }` points.
     */
    static distance(a: any, b: any): number;
    /**
     * Squared distance between two points (cheaper than distance for comparisons).
     */
    static distanceSquared(a: any, b: any): number;
    /**
     * Vector length (magnitude) of an `{ x, y }`.
     */
    static length(v: any): number;
    /**
     * Returns a normalized copy of `{ x, y }` as a plain object. Zero-length
     * vectors return { x: 0, y: 0 }.
     */
    static normalize(v: any): {
        x: number;
        y: number;
    };
    /**
     * Dot product of two `{ x, y }` vectors.
     */
    static dot(a: any, b: any): number;
    /**
     * Angle in radians from a to b.
     */
    static angleBetween(a: any, b: any): number;
    /**
     * Linearly interpolates between two `{ x, y }` points, returning a plain object.
     */
    static lerpVector(a: any, b: any, t: any): {
        x: any;
        y: any;
    };
}
