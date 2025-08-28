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
   * @method getPosition
   * @description Returns the position of the rigidbody
   * @returns {Vector2} - The position of the rigidbody
   */
  getPosition() {
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
