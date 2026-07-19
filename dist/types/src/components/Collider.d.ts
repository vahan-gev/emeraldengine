export default Collider;
/**
 * @class Collider
 * @param {Rigidbody} rigidbody - The rigidbody to attach the collider to
 * @param {boolean} isSensor - Whether the collider is a sensor
 * @param {GameObject} parentObject - The parent object of the collider
 */
declare class Collider {
    constructor(rigidbody: any, isSensor?: boolean, parentObject?: any);
    rigidbody: any;
    parentObject: any;
    isSensor: boolean;
    id: string;
    name: string;
    /** @private */
    private _debugShape;
    /**
     * @method syncDebugShape
     * @description Mirrors a transform onto the debug shape, but only if one has
     * already been created. Never forces lazy creation.
     * @param {Transform} transform - The source transform
     */
    syncDebugShape(transform: Transform): void;
    /**
     * @method setFilter
     * @description Sets the raw planck collision filter on this collider's
     * fixture. Two fixtures collide only when each one's category bit is present
     * in the other's mask. Subclasses must have created `this.collider`
     * (the fixture) first.
     * @param {Object} filter - { category, mask, group }
     * @param {number} [filter.category=0x0001] - This fixture's category bits
     * @param {number} [filter.mask=0xFFFF] - Bits this fixture collides with
     * @param {number} [filter.group=0] - Group index (>0 always collide, <0 never)
     * @returns {Collider} - this
     */
    setFilter({ category, mask, group }?: {
        category?: number;
        mask?: number;
        group?: number;
    }): Collider;
    /** @private */
    private _filter;
    /**
     * @method setCategory
     * @description Sets which named layer this collider belongs to (its category
     * bits), preserving the current mask/group. See {@link CollisionLayers}.
     * @param {string|number} layer - Layer name or raw category bits
     * @returns {Collider} - this
     */
    setCategory(layer: string | number): Collider;
    /**
     * @method setCollidesWith
     * @description Sets which layers this collider can collide with (its mask),
     * preserving the current category/group.
     * @param {string|string[]|number} layers - Layer name(s) or raw mask bits
     * @returns {Collider} - this
     */
    setCollidesWith(layers: string | string[] | number): Collider;
    /**
     * @method getFilter
     * @description Returns the last applied filter, or null if none was set.
     * @returns {{category:number, mask:number, group:number}|null}
     */
    getFilter(): {
        category: number;
        mask: number;
        group: number;
    } | null;
    /**
     * @method _applyFilterSpec
     * @description Applies a friendly filter spec from a constructor, accepting
     * layer names or raw bits. Spec: { category, collidesWith, group }.
     * @private
     */
    private _applyFilterSpec;
    /**
     * @method getRigidBody
     * @description Returns the rigidbody of the collider
     */
    getRigidBody(): any;
    /**
     * @method getCollider
     * @description Returns the collider
     */
    getCollider(): any;
    /**
     * @method setParent
     * @description Sets the parent object of the collider
     */
    setParent(parent: any): void;
    /**
     * @method getParent
     * @description Returns the parent object of the collider
     */
    getParent(): any;
}
