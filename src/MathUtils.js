/**
 * @class MathUtils
 * @description Common math helpers for games: interpolation, clamping, angle
 * conversion, random ranges, and lightweight 2D vector operations that work on
 * any `{ x, y }` object (including planck Vec2 and Emerald Vector2).
 */
class MathUtils {
  /**
   * Clamps a value to the [min, max] range.
   */
  static clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  /**
   * Linearly interpolates between a and b by t (t is not clamped).
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Inverse lerp: returns the t for which lerp(a, b, t) === value.
   */
  static inverseLerp(a, b, value) {
    return a === b ? 0 : (value - a) / (b - a);
  }

  /**
   * Remaps a value from one range to another.
   */
  static map(value, inMin, inMax, outMin, outMax) {
    return MathUtils.lerp(outMin, outMax, MathUtils.inverseLerp(inMin, inMax, value));
  }

  /**
   * Converts degrees to radians.
   */
  static degToRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Converts radians to degrees.
   */
  static radToDeg(radians) {
    return (radians * 180) / Math.PI;
  }

  /**
   * Returns a random float in [min, max).
   */
  static randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  /**
   * Returns a random integer in [min, max] (inclusive).
   */
  static randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  /**
   * Returns a random element of an array (or undefined if empty).
   */
  static randomChoice(array) {
    return array.length ? array[Math.floor(Math.random() * array.length)] : undefined;
  }

  /**
   * Euclidean distance between two `{ x, y }` points.
   */
  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Squared distance between two points (cheaper than distance for comparisons).
   */
  static distanceSquared(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  /**
   * Vector length (magnitude) of an `{ x, y }`.
   */
  static length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  /**
   * Returns a normalized copy of `{ x, y }` as a plain object. Zero-length
   * vectors return { x: 0, y: 0 }.
   */
  static normalize(v) {
    const len = MathUtils.length(v);
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
  }

  /**
   * Dot product of two `{ x, y }` vectors.
   */
  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Angle in radians from a to b.
   */
  static angleBetween(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  /**
   * Linearly interpolates between two `{ x, y }` points, returning a plain object.
   */
  static lerpVector(a, b, t) {
    return { x: MathUtils.lerp(a.x, b.x, t), y: MathUtils.lerp(a.y, b.y, t) };
  }
}

export default MathUtils;
