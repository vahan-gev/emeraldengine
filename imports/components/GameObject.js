import IDManager from "../managers/IDManager.js";
import { Vector2, Vector3 } from "../Physics.js";
import Transform from "../Transform.js";
import RigidBody from "./RigidBody.js";
import Collider from "./Collider.js";
import Drawable from "../Drawable.js";

/**
 * @class GameObject
 * @param {string} name - The name of the game object
 * @param {Vector3} position - The position of the game object
 * @param {number} rotation - The rotation of the game object
 * @param {Vector2} scale - The scale of the game object
 */
class GameObject {
  constructor(
    name,
    position = new Vector3(0, 0, 0),
    rotation = 0,
    scale = new Vector2(1, 1)
  ) {
    this.name = name;
    this.components = [];
    this.id = IDManager.generateUniqueID();
    this.isActive = false;
    this.transform = new Transform(position, rotation, scale);
    this.opacity = 1.0; // 0..1 opacity multiplier for this GameObject
  }

  /**
   * @method addComponent
   * @description Adds a component to the game object
   * @param {Component} componentInstance - The component to add
   */
  addComponent(componentInstance) {
    const componentType = componentInstance.constructor;
    if (this.components.some((comp) => comp instanceof componentType)) {
      throw new Error(
        `Component ${componentType.name} already exists in ${this.name}`
      );
    }
    this.components.push(componentInstance);
    componentInstance.setParent(this);
  }

  /**
   * @method removeComponent
   * @description Removes a component from the game object
   * @param {Component} component - The component to remove
   */
  removeComponent(component) {
    if(!component || !this.components.includes(component)) {
      throw new Error(`Component ${component.name} not found in ${this.name}`);
    }
    if (component instanceof RigidBody) {
      component.destroy();
    }
    this.components = this.components.filter(
      (comp) => comp.id !== component.id
    );
  }

  /**
   * @method setIsActive
   * @description Sets the active state of the game object
   * @param {boolean} bool - The active state
   */
  setIsActive(bool) {
    this.isActive = bool;
  }

  /**
   * @method setOpacity
   * @description Sets the opacity of the game object (0..1)
   * @param {number} value - The opacity value between 0 and 1
   */
  setOpacity(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    this.opacity = Math.max(0, Math.min(1, num));
  }

  /**
   * @method getOpacity
   * @description Gets the opacity of the game object
   * @returns {number} - The opacity value between 0 and 1
   */
  getOpacity() {
    return this.opacity;
  }

  /**
   * @method getComponent
   * @description Returns a component from the game object
   * @param {Component} componentType - The type of component to return
   */
  getComponent(componentType) {
    return this.components.find((comp) => comp instanceof componentType);
  }

  /**
   * @method getRigidBodyAtPosition
   * @description Returns the rigidbody at a position
   * @param {Vector2} position - The position to check
   */
  getRigidBodyAtPosition(position) {
    for (let component of this.components) {
      if (component instanceof RigidBody) {
        if (
          component.getPosition().x === position.x &&
          component.getPosition().y === position.y
        ) {
          return component;
        }
      }
    }

    return null;
  }

  /**
   * @method draw
   * @description Draws the game object
   * @param {Matrix4} globalViewMatrix - The global view matrix
   * @param {WebGLUniformLocation} uniformLocation - The uniform location
   * @param {number} currentTime - The current time
   */
  draw(globalViewMatrix, uniformLocation, currentTime) {
    const drawable = this.getComponent(Drawable);
    const rigidBody = this.getComponent(RigidBody);
    const collider = this.getComponent(Collider);
    if (rigidBody && rigidBody?.getType() === "dynamic") {
      const updatedPos = rigidBody.getBody().getPosition();
      const rigidBodyOffset = rigidBody.getOffset();
      const physicsScale = rigidBody.getPhysics().getScale();

      this.transform.position.x =
        updatedPos.x * physicsScale - rigidBodyOffset.x;
      this.transform.position.y =
        updatedPos.y * physicsScale - rigidBodyOffset.y;

      if (collider) {
        collider.debugShape.gameObject.transform.position.x =
        this.transform.position.x;
        collider.debugShape.gameObject.transform.position.y =
          this.transform.position.y;
      }
    }
    if (drawable) {
      drawable.draw(
        globalViewMatrix,
        uniformLocation,
        currentTime,
        this.transform
      );
    }
  }
}

export default GameObject;
