export default Scene;
/**
 * @class Scene
 * @description Represents a scene
 * @param {Array} objects - The objects in the scene
 */
declare class Scene {
    constructor(objects?: any[]);
    objects: any[];
    /**
     * @method add
     * @description Adds an object to the scene
     * @param {GameObject} object - The object to add
     */
    add(object: GameObject): void;
    /**
     * @method remove
     * @description Removes an object from the scene. By default the object's GPU
     * resources stay alive so it can be re-added later; pass { dispose: true }
     * to also destroy it (free GL buffers/textures, physics bodies) when it is
     * being removed for good.
     * @param {GameObject} object - The object to remove
     * @param {Object} [options] - { dispose = false }
     */
    remove(object: GameObject, options?: any): void;
    /**
     * @method dispose
     * @description Destroys every object in the scene (freeing their GPU
     * resources and physics bodies) and empties it. Call when a level/screen is
     * torn down for good — removing objects without disposing leaks GL buffers
     * over repeated scene swaps.
     */
    dispose(): void;
    /**
     * @method update
     * @description Ticks every active object's component lifecycle. Call once per
     * frame (before or after drawScene) to drive Behaviour components.
     * @param {number} deltaTime - Seconds since the previous frame
     */
    update(deltaTime: number): void;
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
    setActiveRecursive(object: any, bool: boolean): void;
    forEach(callback: any): void;
    [Symbol.iterator](): {
        next: () => {
            value: any;
            done: boolean;
        };
    };
}
import GameObject from "./components/GameObject.js";
