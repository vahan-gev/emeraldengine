import { Vector2 } from "../Physics";
import GameObject from "./GameObject";
import RigidBody from "./RigidBody";
import * as planck from "planck";
/**
 * @class Collider
 * @param {Rigidbody} rigidbody - The rigidbody to attach the collider to
 * @param {boolean} isSensor - Whether the collider is a sensor
 * @param {GameObject} parentObject - The parent object of the collider
 */
declare class Collider {
    rigidbody: RigidBody;
    parentObject: GameObject | null;
    isSensor: boolean;
    id: string;
    name: string;
    collider: planck.Fixture | null;
    fixtureSize: Vector2 | null;
    radius: number | null;
    constructor(rigidbody: RigidBody, isSensor?: boolean, parentObject?: GameObject | null);
    /**
     * @method getRigidBody
     * @description Returns the rigidbody of the collider
     */
    getRigidBody(): RigidBody;
    /**
     * @method setParent
     * @description Sets the parent object of the collider
     */
    setParent(parent: GameObject): void;
    /**
     * @method getCollider
     * @description Returns the collider
     */
    getCollider(): planck.Fixture | null;
    /**
     * @method getFixtureSize
     * @description Returns the size of the collider
     */
    getFixtureSize(): Vector2 | null;
    /**
     * @method getRadius
     * @description Returns the radius of the collider
     */
    getRadius(): number | null;
    /**
     * @method getParent
     * @description Returns the parent object of the collider
     */
    getParent(): GameObject | null;
}
export default Collider;
//# sourceMappingURL=Collider.d.ts.map