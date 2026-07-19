export default CircleCollider;
/**
 * @class CircleCollider
 * @extends Collider
 * @param {Rigidbody} rigidbody - The rigidbody to attach the collider to
 * @param {number} radius - The radius of the collider
 * @param {number} density - The density of the collider
 * @param {number} friction - The friction of the collider
 * @param {number} restitution - The restitution of the collider
 * @param {boolean} isSensor - Whether the collider is a sensor
 * @param {GameObject} parentObject - The parent object of the collider
 */
declare class CircleCollider extends Collider {
    constructor(rigidbody: any, radius: any, density: any, friction: any, restitution: any, isSensor?: boolean, parentObject?: any, filter?: any);
    collider: any;
    radius: any;
    /**
     * @method debugShape
     * @description Lazily builds the debug visualization on first access, so a
     * collider stays free of any GameObject/GL allocation until it is debugged.
     * @returns {CircleColliderDebug} - The debug shape
     */
    get debugShape(): CircleColliderDebug;
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
     * @method getRadius
     * @description Returns the radius of the collider
     */
    getRadius(): any;
}
import Collider from "./Collider.js";
import CircleColliderDebug from "./CircleColliderDebug.js";
