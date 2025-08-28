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
   * @description Removes an object from the scene
   * @param {GameObject} object - The object to remove
   */
  remove(object) {
    if (!(object instanceof GameObject)) {
      throw new Error("Object is not a GameObject");
    }
    object.setIsActive(false);
    this.objects = this.objects.filter((obj) => obj?.id !== object?.id);
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

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator
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
