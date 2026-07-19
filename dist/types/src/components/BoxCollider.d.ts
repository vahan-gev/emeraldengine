export default BoxCollider;
/**
 * @class BoxCollider
 * @extends Collider
 * @param {Rigidbody} rigidbody - The rigidbody to attach the collider to
 * @param {Vector2} fixtureSize - The size of the collider
 * @param {number} density - The density of the collider
 * @param {number} friction - The friction of the collider
 * @param {number} restitution - The restitution of the collider
 * @param {boolean} isSensor - Whether the collider is a sensor
 * @param {GameObject} parentObject - The parent object of the collider
 */
declare class BoxCollider extends Collider {
    constructor(rigidbody: any, fixtureSize: any, density: any, friction: any, restitution: any, isSensor?: boolean, parentObject?: any, filter?: any);
    collider: any;
    fixtureSize: any;
    /**
     * @method debugShape
     * @description Lazily builds the debug visualization on first access, so a
     * collider stays free of any GameObject/GL allocation until it is debugged.
     * @returns {BoxColliderDebug} - The debug shape
     */
    get debugShape(): BoxColliderDebug;
    /**
     * @method showDebugShape
     * @description Shows the debug shape of the collider
     */
    showDebugShape(): void;
    /**
     * @method hideDebugShape
     * @description Hides the debug shape of the collider
     */
    hideDebugShape(): void;
    /**
     * @method getFixtureSize
     * @description Returns the size of the collider
     */
    getFixtureSize(): any;
}
import Collider from "./Collider.js";
import BoxColliderDebug from "./BoxColliderDebug.js";
