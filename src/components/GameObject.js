import IDManager from "../managers/IDManager.js";
import { Vector2, Vector3 } from "../Physics.js";
import Transform from "../Transform.js";
import RigidBody from "./RigidBody.js";
import Collider from "./Collider.js";
import Drawable from "../Drawable.js";
import Behaviour from "./Behaviour.js";

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
    this.opacity = 1.0;

    this.layer = 0;
    this.screenSpace = false;
  }

  /**
   * @method setLayer
   * @description Sets the render layer. Objects are drawn by layer first, then
   * by z within a layer.
   * @param {number} layer - The layer index
   * @returns {GameObject} - this
   */
  setLayer(layer) {
    this.layer = layer;
    return this;
  }

  /**
   * @method setScreenSpace
   * @description When true, the object ignores the camera (fixed on screen) —
   * useful for HUD/UI. Position is then in pixels from the viewport center.
   * Note: not supported for InstancedTexture-based objects.
   * @param {boolean} value
   * @returns {GameObject} - this
   */
  setScreenSpace(value) {
    this.screenSpace = value;
    return this;
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
    if (!component || !this.components.includes(component)) {
      throw new Error(`Component ${component.name} not found in ${this.name}`);
    }
    if (component instanceof RigidBody) {
      component.destroy();
    }
    if (component instanceof Behaviour) {
      component.onDestroy();
    }
    this.components = this.components.filter(
      (comp) => comp.id !== component.id
    );
  }

  /**
   * @method update
   * @description Ticks the lifecycle of Behaviour components on this object.
   * Only Behaviours are ticked here so component types with their own update
   * signature (e.g. InstancedTexture) are left untouched.
   * @param {number} deltaTime - Seconds since the previous frame (time-scaled)
   */
  update(deltaTime) {
    for (const comp of this.components) {
      if (comp instanceof Behaviour && comp.enabled) {
        if (!comp._started) {
          comp._started = true;
          comp.start();
        }
        comp.update(deltaTime);
      }
    }
  }

  /**
   * @method setParent
   * @description Parents this object to another GameObject (or detaches with
   * null). The object's transform then composes on top of the parent's, so
   * moving/rotating/scaling the parent moves its children.
   * @param {GameObject|null} parent - The parent GameObject, or null
   * @returns {GameObject} - this
   */
  setParent(parent) {
    this.transform.setParent(parent ? parent.transform : null);
    return this;
  }

  /**
   * @method addChild
   * @description Parents another GameObject to this one.
   * @param {GameObject} child - The child GameObject
   * @returns {GameObject} - this
   */
  addChild(child) {
    child.setParent(this);
    return this;
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
   * @method syncPhysics
   * @description Copies simulation state (position + rotation) from this
   * object's dynamic rigidbody onto its transform, and mirrors it onto any
   * visible collider debug shape. Called once per frame from the render loop so
   * draw() stays read-only and physics isn't re-applied per camera. Also
   * forwards to components that own their own physics-driven content (e.g.
   * InstancedTexture).
   */
  syncPhysics() {
    const rigidBody = this.getComponent(RigidBody);
    if (rigidBody && rigidBody.getType() === "dynamic") {
      rigidBody.syncTransform(this.transform);
      const collider = rigidBody.getCollider() || this.getComponent(Collider);
      if (collider && typeof collider.syncDebugShape === "function") {
        collider.syncDebugShape(this.transform);
      }
    }
    for (const comp of this.components) {
      if (comp !== rigidBody && typeof comp.syncPhysics === "function") {
        comp.syncPhysics();
      }
    }
  }

  /**
   * @method destroy
   * @description Permanently tears the object down: disposes every Drawable's
   * GPU resources, destroys physics bodies, and runs Behaviour.onDestroy().
   * Use it (or Scene.remove(obj, { dispose: true })) when an object will not
   * be re-added — plain Scene.remove() keeps GPU resources alive for re-use.
   * Safe to call twice.
   */
  destroy() {
    if (this._destroyed) return;
    /** @private */
    this._destroyed = true;
    this.isActive = false;
    for (const comp of this.components) {
      if (comp instanceof Drawable && typeof comp.dispose === "function") {
        comp.dispose();
      } else if (comp instanceof RigidBody) {
        comp.destroy();
      } else if (comp instanceof Behaviour) {
        comp.onDestroy();
      }
    }
    this.components = [];
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
    if (drawable) {
      const worldTransform = this.transform.parent
        ? this.transform.getWorldTransform()
        : this.transform;
      drawable.draw(
        globalViewMatrix,
        uniformLocation,
        currentTime,
        worldTransform
      );
    }
  }
}

export default GameObject;
