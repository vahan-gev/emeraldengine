import { Vector2, Vector3 } from "./Physics";
/**
 * @class Transform
 * @description Represents a transform
 * @param {Vector3} position - The position of the transform
 * @param {number} rotation - The rotation of the transform
 * @param {Vector2} scale - The scale of the transform
 */
declare class Transform {
    position: Vector3;
    rotation: number;
    scale: Vector2;
    constructor(position: Vector3, rotation: number, scale: Vector2);
    /**
     * @method equals
     * @description Checks if the transform is equal to another transform
     * @param {Transform} other - The other transform
     * @returns {boolean} - True if the transform is equal to the other transform
     */
    equals(other: Transform): boolean;
    /**
     * @method getPosition
     * @description Returns the position of the transform
     * @returns {Vector3} - The position of the transform
     */
    getPosition(): Vector3;
    /**
     * @method getRotation
     * @description Returns the rotation of the transform
     * @returns {number} - The rotation of the transform
     */
    getRotation(): number;
    /**
     * @method getScale
     * @description Returns the scale of the transform
     * @returns {Vector2} - The scale of the transform
     */
    getScale(): Vector2;
}
export default Transform;
//# sourceMappingURL=Transform.d.ts.map