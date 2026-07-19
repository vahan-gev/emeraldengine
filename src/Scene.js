import GameObject from "./components/GameObject.js";

/**
 * @class Scene
 * @description Represents a scene
 * @param {Array} objects - The objects in the scene
 */
class Scene {
  constructor(objects = []) {
    this.objects = objects;
  }

  /**
   * @method add
   * @description Adds an object to the scene
   * @param {GameObject} object - The object to add
   */
  add(object) {
    if (!(object instanceof GameObject)) {
      throw new Error("Object is not a GameObject");
    }
    object.setIsActive(true);
    if (!this.objects.some((obj) => obj.id === object.id)) {
      this.objects.push(object);
    }
  }

  /**
   * @method remove
   * @description Removes an object from the scene. By default the object's GPU
   * resources stay alive so it can be re-added later; pass { dispose: true }
   * to also destroy it (free GL buffers/textures, physics bodies) when it is
   * being removed for good.
   * @param {GameObject} object - The object to remove
   * @param {Object} [options] - { dispose = false }
   */
  remove(object, options = {}) {
    if (!(object instanceof GameObject)) {
      throw new Error("Object is not a GameObject");
    }
    object.setIsActive(false);
    this.objects = this.objects.filter(function (obj) {
      var objId = obj ? obj.id : undefined;
      var targetId = object ? object.id : undefined;
      return objId !== targetId;
    });
    if (options.dispose) object.destroy();
  }

  /**
   * @method dispose
   * @description Destroys every object in the scene (freeing their GPU
   * resources and physics bodies) and empties it. Call when a level/screen is
   * torn down for good — removing objects without disposing leaks GL buffers
   * over repeated scene swaps.
   */
  dispose() {
    for (const object of this.objects) {
      if (object && typeof object.destroy === "function") object.destroy();
    }
    this.objects = [];
  }

  /**
   * @method update
   * @description Ticks every active object's component lifecycle. Call once per
   * frame (before or after drawScene) to drive Behaviour components.
   * @param {number} deltaTime - Seconds since the previous frame
   */
  update(deltaTime) {
    for (const object of this.objects) {
      if (object.isActive && typeof object.update === "function") {
        object.update(deltaTime);
      }
    }
  }

  /**
   * @method setIsActive
   * @description Sets the active state of the scene
   * @param {boolean} bool - The active state
   */
  setIsActive(bool) {
    for (let object of this.objects) {
      this.setActiveRecursive(object, bool);
    }
  }

  /**
   * @method setActiveRecursive
   * @description Sets the active state of the scene recursively
   * @param {Object} object - The object to set the active state of
   * @param {boolean} bool - The active state
   */
  setActiveRecursive(object, bool) {
    object.setIsActive(bool);
  }

  [Symbol.iterator]() {
    let index = -1;
    const data = this.objects;

    return {
      next: () => ({ value: data[++index], done: !(index in data) }),
    };
  }

  forEach(callback) {
    for (const obj of this.objects) {
      callback(obj);
    }
  }
}

export default Scene;
