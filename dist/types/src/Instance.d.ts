export default Instance;
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
    constructor(name: any, position?: Vector3, scale?: Vector2, rotation?: number, frame?: number);
    name: any;
    transform: Transform;
    id: string;
    parent: Instance;
    frame: number;
    isAnimating: boolean;
    animationFrames: any[];
    currentAnimationIndex: number;
    animationSpeed: number;
    lastFrameTime: number;
    playOnce: boolean;
    originalFrame: number;
    components: any[];
    /** @private */
    private _tint;
    /**
     * @method setColor
     * @description Sets this instance's tint. Accepts a Color (0..255 channels) or
     * raw 0..1 components. Multiplies the texture/base color in the shader.
     * @param {Color|number} colorOrR - A Color instance, or the red channel
     * @param {number} [g]
     * @param {number} [b]
     * @param {number} [a]
     */
    setColor(colorOrR: Color | number, g?: number, b?: number, a?: number): void;
    /**
     * @method setTexCoords
     * @description Gives this instance an explicit UV quad (8 floats, one vec2
     * per corner in the same order as getFrameTexCoords) instead of the shared
     * frame grid. Lets one InstancedTexture batch tiles from an atlas with
     * margins/spacing or per-instance flips. Pass null to go back to `frame`.
     * @param {number[]|Float32Array|null} uv8 - 8 UV floats, or null to clear
     */
    setTexCoords(uv8: number[] | Float32Array | null): void;
    /** @private */
    private _regionUV;
    /**
     * @method setParent
     * @description Sets the parent of the instance
     * @param {Instance} parent - The parent of the instance
     */
    setParent(parent: Instance): void;
    /**
     * @method playAnimation
     * @description Plays an animation with an array of frames
     * @param {Array} frames - The frames to play
     * @param {number} speed - The speed of the animation
     */
    playAnimation(frames: any[], speed?: number): void;
    /**
     * @method playAnimationOnce
     * @description Plays an animation with an array of frames once then stops
     * @param {Array} frames - The frames to play
     * @param {number} speed - The speed of the animation
     */
    playAnimationOnce(frames: any[], speed?: number): void;
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
    addComponent(componentInstance: Component): void;
    /**
     * @method removeComponent
     * @description Removes a component from the instance
     * @param {Component} component - The component to remove
     */
    removeComponent(component: Component): void;
    /**
     * @method getComponent
     * @description Gets a component from the instance
     * @param {Component} componentType - The type of the component to get
     * @returns {Component} - The component
     */
    getComponent(componentType: Component): Component;
}
import Transform from "./Transform.js";
import { Vector3 } from "./Physics.js";
import { Vector2 } from "./Physics.js";
