import * as planck from "planck";
import SceneManager from "../managers/SceneManager.js";
import CircleColliderDebug from "./CircleColliderDebug.js";
import Collider from "./Collider.js";

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
class CircleCollider extends Collider {
  constructor(
    rigidbody,
    radius,
    density,
    friction,
    restitution,
    isSensor = false,
    parentObject = null,
    filter = null
  ) {
    super(rigidbody, isSensor, parentObject);
    this.collider = rigidbody
      .getBody()
      .createFixture(new planck.Circle(radius), {
        density: density,
        friction: friction,
        restitution: restitution,
        isSensor: isSensor,
      });
    this.radius = radius;
    this.rigidbody.setCollider(this);
    this.name = "CircleCollider" + this.id;
    this._applyFilterSpec(filter);
  }

  /**
   * @method debugShape
   * @description Lazily builds the debug visualization on first access, so a
   * collider stays free of any GameObject/GL allocation until it is debugged.
   * @returns {CircleColliderDebug} - The debug shape
   */
  get debugShape() {
    if (!this._debugShape) {
      /** @private */
      this._debugShape = new CircleColliderDebug(this.rigidbody);
    }
    return this._debugShape;
  }

  /**
   * @method showDebugShape
   * @description Shows the debug shape of the collider
   */
  showDebugShape() {
    var scene = SceneManager.getScene();
    if (scene) {
      scene.add(this.debugShape.gameObject);
    }
  }

  /**
   * @method hideDebugShape
   * @description Hides the debug shape of the collider
   */
  hideDebugShape() {
    if (!this._debugShape) return;
    var scene = SceneManager.getScene();
    if (scene) {
      scene.remove(this._debugShape.gameObject);
    }
  }

  /**
   * @method getRadius
   * @description Returns the radius of the collider
   */
  getRadius() {
    return this.radius;
  }
}

export default CircleCollider;
