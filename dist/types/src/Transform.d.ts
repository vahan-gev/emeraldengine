export default Transform;
/**
 * @class Transform
 * @description Represents a transform with optional parent/child hierarchy.
 * Local position/rotation/scale are composed up the parent chain to produce a
 * world transform. Objects with no parent behave exactly as before (the world
 * transform is the local transform), so existing code is unaffected.
 * @param {Vector3} position - The local position
 * @param {number} rotation - The local rotation (radians)
 * @param {Vector2} scale - The local scale
 */
declare class Transform {
    constructor(position: any, rotation: any, scale: any);
    position: any;
    rotation: any;
    scale: any;
    parent: any;
    children: any[];
    /** @private */
    private _world;
    /**
     * @method setParent
     * @description Sets (or clears) the parent transform, maintaining the
     * children list on both sides.
     * @param {Transform|null} parent - The parent transform, or null to detach
     */
    setParent(parent: Transform | null): void;
    /**
     * @method getWorldParts
     * @description Returns the composed world TRS as primitives. Composition is
     * standard 2D: child local space is scaled and rotated by the parent.
     * @returns {{px:number, py:number, pz:number, rot:number, sx:number, sy:number}}
     */
    getWorldParts(): {
        px: number;
        py: number;
        pz: number;
        rot: number;
        sx: number;
        sy: number;
    };
    /**
     * @method getWorldTransform
     * @description Returns a transform-shaped object ({position, rotation, scale})
     * in world space. The returned object is reused between calls.
     * @returns {{position:{x,y,z}, rotation:number, scale:{x,y}}}
     */
    getWorldTransform(): {
        position: {
            x: any;
            y: any;
            z: any;
        };
        rotation: number;
        scale: {
            x: any;
            y: any;
        };
    };
    /**
     * @method getWorldPosition
     * @description Returns the world-space position as a plain { x, y, z }.
     */
    getWorldPosition(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * @method equals
     * @description Checks if the transform is equal to another transform
     * @param {Transform} other - The other transform
     * @returns {boolean} - True if the transform is equal to the other transform
     */
    equals(other: Transform): boolean;
    /**
     * @method getPosition
     * @description Returns the local position of the transform
     * @returns {Vector3} - The position of the transform
     */
    getPosition(): Vector3;
    /**
     * @method getRotation
     * @description Returns the local rotation of the transform
     * @returns {number} - The rotation of the transform
     */
    getRotation(): number;
    /**
     * @method getScale
     * @description Returns the local scale of the transform
     * @returns {Vector2} - The scale of the transform
     */
    getScale(): Vector2;
}
