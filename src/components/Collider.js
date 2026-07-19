import IDManager from "../managers/IDManager.js";
import CollisionLayers from "../CollisionLayers.js";

/**
 * @class Collider
 * @param {Rigidbody} rigidbody - The rigidbody to attach the collider to
 * @param {boolean} isSensor - Whether the collider is a sensor
 * @param {GameObject} parentObject - The parent object of the collider
 */
class Collider {
  constructor(rigidbody, isSensor = false, parentObject = null) {
    this.rigidbody = rigidbody;
    this.parentObject = parentObject;
    this.isSensor = isSensor;
    this.id = IDManager.generateUniqueID();
    this.name = "Collider" + this.id;

    /** @private */
    this._debugShape = null;
  }

  /**
   * @method syncDebugShape
   * @description Mirrors a transform onto the debug shape, but only if one has
   * already been created. Never forces lazy creation.
   * @param {Transform} transform - The source transform
   */
  syncDebugShape(transform) {
    if (!this._debugShape) return;
    const t = this._debugShape.gameObject.transform;
    t.position.x = transform.position.x;
    t.position.y = transform.position.y;
    t.rotation = transform.rotation;
  }

  /**
   * @method setFilter
   * @description Sets the raw planck collision filter on this collider's
   * fixture. Two fixtures collide only when each one's category bit is present
   * in the other's mask. Subclasses must have created `this.collider`
   * (the fixture) first.
   * @param {Object} filter - { category, mask, group }
   * @param {number} [filter.category=0x0001] - This fixture's category bits
   * @param {number} [filter.mask=0xFFFF] - Bits this fixture collides with
   * @param {number} [filter.group=0] - Group index (>0 always collide, <0 never)
   * @returns {Collider} - this
   */
  setFilter({ category = 0x0001, mask = 0xffff, group = 0 } = {}) {
    if (this.collider && typeof this.collider.setFilterData === "function") {
      this.collider.setFilterData({
        categoryBits: category,
        maskBits: mask,
        groupIndex: group,
      });
      /** @private */
      this._filter = { category, mask, group };
    }
    return this;
  }

  /**
   * @method setCategory
   * @description Sets which named layer this collider belongs to (its category
   * bits), preserving the current mask/group. See {@link CollisionLayers}.
   * @param {string|number} layer - Layer name or raw category bits
   * @returns {Collider} - this
   */
  setCategory(layer) {
    const category =
      typeof layer === "number" ? layer : CollisionLayers.bit(layer);
    const current = this._filter || {};
    return this.setFilter({
      category,
      mask: current.mask ?? 0xffff,
      group: current.group ?? 0,
    });
  }

  /**
   * @method setCollidesWith
   * @description Sets which layers this collider can collide with (its mask),
   * preserving the current category/group.
   * @param {string|string[]|number} layers - Layer name(s) or raw mask bits
   * @returns {Collider} - this
   */
  setCollidesWith(layers) {
    const current = this._filter || {};
    return this.setFilter({
      category: current.category ?? 0x0001,
      mask: CollisionLayers.mask(layers),
      group: current.group ?? 0,
    });
  }

  /**
   * @method getFilter
   * @description Returns the last applied filter, or null if none was set.
   * @returns {{category:number, mask:number, group:number}|null}
   */
  getFilter() {
    return this._filter || null;
  }

  /**
   * @method _applyFilterSpec
   * @description Applies a friendly filter spec from a constructor, accepting
   * layer names or raw bits. Spec: { category, collidesWith, group }.
   * @private
   */
  _applyFilterSpec(spec) {
    if (!spec) return;
    if (spec.category != null) this.setCategory(spec.category);
    if (spec.collidesWith != null) this.setCollidesWith(spec.collidesWith);
    if (spec.group != null) {
      const f = this._filter || {};
      this.setFilter({
        category: f.category ?? 0x0001,
        mask: f.mask ?? 0xffff,
        group: spec.group,
      });
    }
  }

  /**
   * @method getRigidBody
   * @description Returns the rigidbody of the collider
   */
  getRigidBody() {
    return this.rigidbody;
  }

  /**
   * @method getCollider
   * @description Returns the collider
   */
  getCollider() {
    return this.collider;
  }

  /**
   * @method setParent
   * @description Sets the parent object of the collider
   */
  setParent(parent) {
    this.parentObject = parent;
  }

  /**
   * @method getParent
   * @description Returns the parent object of the collider
   */
  getParent() {
    return this.parentObject;
  }
}

export default Collider;
