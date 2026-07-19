import IDManager from "../managers/IDManager.js";

/**
 * @class Behaviour
 * @description Base class for custom per-object game logic. Subclass it and
 * override `start()` (called once, the first update after being added) and
 * `update(deltaTime)` (called every frame the owner is active). Add it to a
 * GameObject like any other component; it is ticked by `Scene.update(dt)` via
 * `GameObject.update(dt)`.
 *
 * @example
 * class Spinner extends Behaviour {
 *   start() { this.speed = 2; }
 *   update(dt) { this.gameObject.transform.rotation += this.speed * dt; }
 * }
 * obj.addComponent(new Spinner());
 */
class Behaviour {
  constructor() {
    this.id = IDManager.generateUniqueID();
    this.parentObject = null;
    this.enabled = true;
    /** @private */
    this._started = false;
  }

  /**
   * @member gameObject
   * @description Convenience accessor for the owning GameObject.
   */
  get gameObject() {
    return this.parentObject;
  }

  /**
   * @method setParent
   * @description Sets the owning object. Called automatically by addComponent.
   * @param {Object} parent - The owning GameObject (or Instance)
   */
  setParent(parent) {
    this.parentObject = parent;
  }

  /**
   * @method getParent
   * @description Returns the owning object
   * @returns {Object} - The owning object
   */
  getParent() {
    return this.parentObject;
  }

  /**
   * @method start
   * @description Called once before the first update. Override in subclasses.
   */
  start() {}

  /**
   * @method update
   * @description Called every active frame. Override in subclasses.
   * @param {number} deltaTime - Seconds since the previous frame (time-scaled)
   */
  update(deltaTime) {}

  /**
   * @method onDestroy
   * @description Called when the behaviour is removed. Override for cleanup.
   */
  onDestroy() {}

  /**
   * @method onCollisionEnter
   * @description Called when the owner's body starts touching another. Requires
   * the Physics world to be ticked. Override in subclasses.
   * @param {Object} other - The other GameObject/Instance (or null)
   * @param {Object} contact - The planck contact
   */
  onCollisionEnter(other, contact) {}

  /**
   * @method onCollisionExit
   * @description Called when the owner's body stops touching another.
   * @param {Object} other - The other GameObject/Instance (or null)
   * @param {Object} contact - The planck contact
   */
  onCollisionExit(other, contact) {}
}

export default Behaviour;
