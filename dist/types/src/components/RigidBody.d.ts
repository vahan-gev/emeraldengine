export default RigidBody;
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
    constructor(physics: any, type: any, position: any, fixedRotation: any, parentObject?: any, offset?: Vector2);
    physics: any;
    offset: Vector2;
    type: any;
    body: any;
    parentObject: any;
    position: any;
    collider: Collider;
    id: string;
    name: string;
    /**
     * @method updatePosition
     * @description Updates the position of the rigidbody
     * @param {Vector2} position - The new position
     */
    updatePosition(position: Vector2): void;
    /**
     * @method getWorldX
     * @description The single source of truth for body(physics) -> world(pixel)
     * conversion on X: undo the scale and the spawn offset.
     * @returns {number} - The live world-space x of the body
     * @private
     */
    private getWorldX;
    /**
     * @method getWorldY
     * @description World-space y counterpart of getWorldX.
     * @returns {number} - The live world-space y of the body
     * @private
     */
    private getWorldY;
    /**
     * @method syncTransform
     * @description Writes the body's live world position and angle into a
     * Transform. This is the one place body state is copied onto a renderable, so
     * position and rotation stay in lock-step. Static/kinematic bodies are not
     * driven by the simulation, so only dynamic bodies write back.
     * @param {Transform} transform - The transform to update in place
     */
    syncTransform(transform: Transform): void;
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
     * @method setLinearVelocity
     * @description Sets the body's linear velocity in world (pixel) units per
     * second. Converts to physics units internally.
     * @param {number} vx - Horizontal velocity (world units/sec)
     * @param {number} vy - Vertical velocity (world units/sec)
     */
    setLinearVelocity(vx: number, vy: number): void;
    /**
     * @method getLinearVelocity
     * @description Returns the body's linear velocity in world (pixel) units/sec.
     * @returns {{x:number, y:number}}
     */
    getLinearVelocity(): {
        x: number;
        y: number;
    };
    /**
     * @method applyImpulse
     * @description Applies a linear impulse (world units) at the body's center.
     * @param {number} ix
     * @param {number} iy
     */
    applyImpulse(ix: number, iy: number): void;
    /**
     * @method setAwake
     * @description Wakes or sleeps the body.
     * @param {boolean} awake
     */
    setAwake(awake: boolean): void;
    /**
     * @method setContinuous
     * @description Enables continuous collision detection (CCD) for this body by
     * marking it a "bullet". Fast-moving bodies (e.g. a dash, a projectile, a
     * player falling at high speed) otherwise sweep so far in a single fixed step
     * that they tunnel straight through thin static geometry; with CCD on, planck
     * solves the swept path against static bodies so the body stops at the wall
     * instead of teleporting past it. Costs more per step, so reserve it for the
     * handful of bodies that actually move fast.
     * @param {boolean} [enabled=true]
     * @returns {RigidBody} - this
     */
    setContinuous(enabled?: boolean): RigidBody;
    /**
     * @method isContinuous
     * @description Whether CCD (bullet mode) is enabled for this body.
     * @returns {boolean}
     */
    isContinuous(): boolean;
    /**
     * @method getPosition
     * @description Returns the live world-space position of the body (kept in sync
     * with the simulation), not the spawn position. Use getInitialPosition() for
     * the position the body was created at.
     * @returns {Vector2} - The current world-space position of the rigidbody
     */
    getPosition(): Vector2;
    /**
     * @method getInitialPosition
     * @description Returns the world-space position the body was created at.
     * @returns {Vector2} - The spawn position of the rigidbody
     */
    getInitialPosition(): Vector2;
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
    getCollider(): Collider;
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
    getType(): string | "static" | "dynamic" | "kinematic";
}
import { Vector2 } from "../Physics.js";
import Collider from "./Collider.js";
import * as planck from "planck";
