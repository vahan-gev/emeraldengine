import GameObject from "./components/GameObject";
/**
 * @class Scene
 * @description Represents a scene
 * @param {Array} objects - The objects in the scene
 */
declare class Scene {
    objects: GameObject[];
    constructor(objects?: GameObject[]);
    /**
     * @method add
     * @description Adds an object to the scene
     * @param {GameObject} object - The object to add
     */
    add(object: GameObject): void;
    /**
     * @method remove
     * @description Removes an object from the scene
     * @param {GameObject} object - The object to remove
     */
    remove(object: GameObject): void;
    /**
     * @method setIsActive
     * @description Sets the active state of the scene
     * @param {boolean} bool - The active state
     */
    setIsActive(bool: boolean): void;
    /**
     * @method setActiveRecursive
     * @description Sets the active state of the scene recursively
     * @param {Object} object - The object to set the active state of
     * @param {boolean} bool - The active state
     */
    setActiveRecursive(object: GameObject, bool: boolean): void;
    [Symbol.iterator](): Iterator<GameObject>;
    forEach(callback: (object: GameObject) => void): void;
}
export default Scene;
//# sourceMappingURL=Scene.d.ts.map