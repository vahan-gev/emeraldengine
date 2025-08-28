import * as planck from "planck";
import CircleColliderDebug from "./CircleColliderDebug";
import Collider from "./Collider";
import RigidBody from "./RigidBody";
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
    radius: number;
    debugShape: CircleColliderDebug;
    collider: planck.Fixture;
    name: string;
    constructor(rigidbody: RigidBody, radius: number, density: number, friction: number, restitution: number, isSensor?: boolean, parentObject?: null);
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
    getRadius(): number;
}
export default CircleCollider;
//# sourceMappingURL=CircleCollider.d.ts.map