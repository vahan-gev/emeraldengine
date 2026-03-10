import * as planck from "planck";
import { Physics, Vector2 } from "../Physics";
import Collider from "./Collider";
import GameObject from "./GameObject";
/**
 * @class RigidBody
 * @param {Physics} physics - The physics engine
 * @param {string | "static" | "dynamic" | "kinematic"} type - The type of rigidbody
 * @param {Vector2} position - The position of the rigidbody
 * @param {boolean} fixedRotation - Whether the rigidbody is fixed rotation
 * @param {GameObject} parentObject - The parent object of the rigidbody
 * @param {Vector2} offset - The offset of the rigidbody
 */
declare class RigidBody {
    physics: Physics;
    offset: Vector2;
    type: string;
    body: planck.Body;
    parentObject: GameObject | null;
    position: Vector2;
    collider: Collider | null;
    id: string;
    name: string;
    constructor(physics: Physics, type: string, position: Vector2, fixedRotation: boolean, parentObject?: GameObject | null, offset?: Vector2);
    /**
     * @method updatePosition
     * @description Updates the position of the rigidbody
     * @param {Vector2} position - The new position
     */
    updatePosition(position: Vector2): void;
    /**
     * @method getOffset
     * @description Returns the offset of the rigidbody
     * @returns {Vector2} - The offset of the rigidbody
     */
    getOffset(): Vector2;
    /**
     * @method setCollider
     * @description Sets the collider of the rigidbody
     * @param {Collider} collider - The collider to set
     */
    setCollider(collider: Collider): void;
    /**
     * @method setRotation
     * @description Sets the rotation of the rigidbody
     * @param {number} rotation - The new rotation
     */
    setRotation(rotation: number): void;
    /**
     * @method getPosition
     * @description Returns the position of the rigidbody
     * @returns {Vector2} - The position of the rigidbody
     */
    getPosition(): Vector2;
    /**
     * @method getAngle
     * @description Returns the angle of the rigidbody
     * @returns {number} - The angle of the rigidbody
     */
    getAngle(): number;
    /**
     * @method getCollider
     * @description Returns the collider of the rigidbody
     * @returns {Collider} - The collider of the rigidbody
     */
    getCollider(): Collider | null;
    /**
     * @method getBody
     * @description Returns the body of the rigidbody
     * @returns {planck.Body} - The body of the rigidbody
     */
    getBody(): planck.Body;
    /**
     * @method getPhysics
     * @description Returns the physics engine of the rigidbody
     * @returns {Physics} - The physics engine of the rigidbody
     */
    getPhysics(): Physics;
    /**
     * @method destroy
     * @description Destroys the rigidbody
     */
    destroy(): void;
    /**
     * @method detachCollider
     * @description Detaches a collider from the rigidbody
     * @param {Collider} collider - The collider to detach
     */
    detachCollider(collider: Collider): void;
    /**
     * @method setParent
     * @description Sets the parent object of the rigidbody
     * @param {GameObject} parent - The parent object to set
     */
    setParent(parent: GameObject): void;
    /**
     * @method getType
     * @description Returns the type of the rigidbody
     * @returns {string | "static" | "dynamic" | "kinematic"} - The type of the rigidbody
     */
    getType(): string;
}
export default RigidBody;
//# sourceMappingURL=RigidBody.d.ts.map