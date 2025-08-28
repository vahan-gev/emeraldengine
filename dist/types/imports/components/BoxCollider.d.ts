import * as planck from "planck";
import BoxColliderDebug from "./BoxColliderDebug";
import Collider from "./Collider";
import { Vector2 } from "../Physics";
import RigidBody from "./RigidBody";
import GameObject from "./GameObject";
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
    collider: planck.Fixture;
    fixtureSize: Vector2;
    name: string;
    debugShape: BoxColliderDebug;
    constructor(rigidbody: RigidBody, fixtureSize: Vector2, density: number, friction: number, restitution: number, isSensor?: boolean, parentObject?: GameObject | null);
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
    getFixtureSize(): Vector2;
}
export default BoxCollider;
//# sourceMappingURL=BoxCollider.d.ts.map