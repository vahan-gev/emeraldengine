import * as planck from "planck";
import IDManager from "../managers/IDManager.js";
import { Vector2 } from "../Physics.js";
import Collider from "./Collider.js";

/**
 * @class RigidBody
 * @param {Physics} physics - The physics engine
 * @param {string | "static" | "dynamic" | "kinematic"} type - The type of rigidbody
 * @param {Vector2} position - The position of the rigidbody
 * @param {boolean} fixedRotation - Whether the rigidbody is fixed rotation
 * @param {GameObject} parentObject - The parent object of the rigidbody
 * @param {Vector2} offset - The offset of the rigidbody
 */
class RigidBody {
  constructor(
    physics,
    type,
    position,
    fixedRotation,
    parentObject = null,
    offset = new Vector2(0, 0)
  ) {
    this.physics = physics;
    this.offset = offset;
    this.type = type;
    this.body = physics.world.createBody({
      type: type,
      position: new planck.Vec2(
        (position.x + offset.x) / physics.scale,
        (position.y + offset.y) / physics.scale
      ),
      fixedRotation: fixedRotation,
    });
    this.parentObject = parentObject;
    this.position = position;
    this.collider = null;
    this.id = IDManager.generateUniqueID();
    this.name = "RigidBody" + this.id;

    this.body.setUserData(this);
  }

  /**
   * @method updatePosition
   * @description Updates the position of the rigidbody
   * @param {Vector2} position - The new position
   */
  updatePosition(position) {
    this.body.setPosition(
      new planck.Vec2(
        (position.x + this.offset.x) / this.physics.scale,
        (position.y + this.offset.y) / this.physics.scale
      )
    );
  }

  /**
   * @method getWorldX
   * @description The single source of truth for body(physics) -> world(pixel)
   * conversion on X: undo the scale and the spawn offset.
   * @returns {number} - The live world-space x of the body
   * @private
   */
  getWorldX() {
    return this.body.getPosition().x * this.physics.scale - this.offset.x;
  }

  /**
   * @method getWorldY
   * @description World-space y counterpart of getWorldX.
   * @returns {number} - The live world-space y of the body
   * @private
   */
  getWorldY() {
    return this.body.getPosition().y * this.physics.scale - this.offset.y;
  }

  /**
   * @method syncTransform
   * @description Writes the body's live world position and angle into a
   * Transform. This is the one place body state is copied onto a renderable, so
   * position and rotation stay in lock-step. Static/kinematic bodies are not
   * driven by the simulation, so only dynamic bodies write back.
   * @param {Transform} transform - The transform to update in place
   */
  syncTransform(transform) {
    if (this.type !== "dynamic") return;
    transform.position.x = this.getWorldX();
    transform.position.y = this.getWorldY();
    transform.rotation = this.body.getAngle();
  }

  /**
   * @method getOffset
   * @description Returns the offset of the rigidbody
   * @returns {Vector2} - The offset of the rigidbody
   */
  getOffset() {
    return this.offset;
  }

  /**
   * @method setCollider
   * @description Sets the collider of the rigidbody
   * @param {Collider} collider - The collider to set
   */
  setCollider(collider) {
    if (collider instanceof Collider) {
      this.collider = collider;
    }
  }

  /**
   * @method setRotation
   * @description Sets the rotation of the rigidbody
   * @param {number} rotation - The new rotation
   */
  setRotation(rotation) {
    this.body.setAngle(rotation);
  }

  /**
   * @method setLinearVelocity
   * @description Sets the body's linear velocity in world (pixel) units per
   * second. Converts to physics units internally.
   * @param {number} vx - Horizontal velocity (world units/sec)
   * @param {number} vy - Vertical velocity (world units/sec)
   */
  setLinearVelocity(vx, vy) {
    this.body.setLinearVelocity(
      new planck.Vec2(vx / this.physics.scale, vy / this.physics.scale)
    );
  }

  /**
   * @method getLinearVelocity
   * @description Returns the body's linear velocity in world (pixel) units/sec.
   * @returns {{x:number, y:number}}
   */
  getLinearVelocity() {
    const v = this.body.getLinearVelocity();
    return { x: v.x * this.physics.scale, y: v.y * this.physics.scale };
  }

  /**
   * @method applyImpulse
   * @description Applies a linear impulse (world units) at the body's center.
   * @param {number} ix
   * @param {number} iy
   */
  applyImpulse(ix, iy) {
    this.body.applyLinearImpulse(
      new planck.Vec2(ix / this.physics.scale, iy / this.physics.scale),
      this.body.getWorldCenter(),
      true
    );
  }

  /**
   * @method setAwake
   * @description Wakes or sleeps the body.
   * @param {boolean} awake
   */
  setAwake(awake) {
    this.body.setAwake(awake);
  }

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
  setContinuous(enabled = true) {
    this.body.setBullet(!!enabled);
    return this;
  }

  /**
   * @method isContinuous
   * @description Whether CCD (bullet mode) is enabled for this body.
   * @returns {boolean}
   */
  isContinuous() {
    return this.body.isBullet();
  }

  /**
   * @method getPosition
   * @description Returns the live world-space position of the body (kept in sync
   * with the simulation), not the spawn position. Use getInitialPosition() for
   * the position the body was created at.
   * @returns {Vector2} - The current world-space position of the rigidbody
   */
  getPosition() {
    return new Vector2(this.getWorldX(), this.getWorldY());
  }

  /**
   * @method getInitialPosition
   * @description Returns the world-space position the body was created at.
   * @returns {Vector2} - The spawn position of the rigidbody
   */
  getInitialPosition() {
    return this.position;
  }

  /**
   * @method getAngle
   * @description Returns the angle of the rigidbody
   * @returns {number} - The angle of the rigidbody
   */
  getAngle() {
    return this.body.getAngle();
  }

  /**
   * @method getCollider
   * @description Returns the collider of the rigidbody
   * @returns {Collider} - The collider of the rigidbody
   */
  getCollider() {
    return this.collider;
  }

  /**
   * @method getBody
   * @description Returns the body of the rigidbody
   * @returns {planck.Body} - The body of the rigidbody
   */
  getBody() {
    return this.body;
  }

  /**
   * @method getPhysics
   * @description Returns the physics engine of the rigidbody
   * @returns {Physics} - The physics engine of the rigidbody
   */
  getPhysics() {
    return this.physics;
  }

  /**
   * @method destroy
   * @description Destroys the rigidbody
   */
  destroy() {
    this.physics.world.destroyBody(this.body);
  }

  /**
   * @method detachCollider
   * @description Detaches a collider from the rigidbody
   * @param {Collider} collider - The collider to detach
   */
  detachCollider(collider) {
    if (collider && collider.getCollider()) {
      this.body.destroyFixture(collider.getCollider());
      this.collider = null;
    }
  }

  /**
   * @method setParent
   * @description Sets the parent object of the rigidbody
   * @param {GameObject} parent - The parent object to set
   */
  setParent(parent) {
    this.parentObject = parent;
  }

  /**
   * @method getType
   * @description Returns the type of the rigidbody
   * @returns {string | "static" | "dynamic" | "kinematic"} - The type of the rigidbody
   */
  getType() {
    return this.type;
  }
}

export default RigidBody;
