import InstancedTexture from "./InstancedTexture";
import { Vector2, Vector3 } from "./Physics";
import Transform from "./Transform";
/**
 * @class Instance
 * @description Represents an instance
 * @param {string} name - The name of the instance
 * @param {Vector3} position - The position of the instance
 * @param {Vector2} scale - The scale of the instance
 * @param {number} rotation - The rotation of the instance
 * @param {number} frame - The frame of the instance
 */
declare class Instance {
    name: string;
    transform: Transform;
    id: string;
    parent: InstancedTexture | null;
    frame: number;
    isAnimating: boolean;
    animationFrames: number[];
    currentAnimationIndex: number;
    animationSpeed: number;
    lastFrameTime: number;
    playOnce: boolean;
    originalFrame: number;
    components: any[];
    constructor(name: string, position?: Vector3, scale?: Vector2, rotation?: number, frame?: number);
    /**
     * @method setParent
     * @description Sets the parent of the instance
     * @param {Instance} parent - The parent of the instance
     */
    setParent(parent: InstancedTexture): void;
    /**
     * @method playAnimation
     * @description Plays an animation with an array of frames
     * @param {Array} frames - The frames to play
     * @param {number} speed - The speed of the animation
     */
    playAnimation(frames: number[], speed?: number): void;
    /**
     * @method playAnimationOnce
     * @description Plays an animation with an array of frames once then stops
     * @param {Array} frames - The frames to play
     * @param {number} speed - The speed of the animation
     */
    playAnimationOnce(frames: number[], speed?: number): void;
    /**
     * @method stopAnimation
     * @description Stops the animation and optionally reverts to the original frame
     * @param {boolean} revertToOriginal - Whether to revert to the original frame
     */
    stopAnimation(revertToOriginal?: boolean): void;
    /**
     * @method setFrame
     * @description Sets a specific frame
     * @param {number} frame - The frame to set
     */
    setFrame(frame: number): void;
    /**
     * @method updateAnimation
     * @description Updates the animation
     * @param {number} currentTime - The current time
     */
    updateAnimation(currentTime: number): boolean;
    /**
     * @method addComponent
     * @description Adds a component to the instance
     * @param {Component} componentInstance - The component to add
     */
    addComponent(componentInstance: any): void;
    /**
     * @method removeComponent
     * @description Removes a component from the instance
     * @param {Component} component - The component to remove
     */
    removeComponent(component: any): void;
    /**
     * @method getComponent
     * @description Gets a component from the instance
     * @param {Component} componentType - The type of the component to get
     * @returns {Component} - The component
     */
    getComponent(componentType: any): any;
}
export default Instance;
//# sourceMappingURL=Instance.d.ts.map