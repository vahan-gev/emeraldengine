import Instance from "./Instance";
import Drawable from "./Drawable";
import { Vector3 } from "./Physics";
/**
 * @class InstancedTexture
 * @description Represents an instanced texture component
 * @param {string} texturePath - The path to the texture
 * @param {number} instanceCount - The number of instances
 * @param {number} frameWidth - The width of the frame
 * @param {number} frameHeight - The height of the frame
 * @param {number} framesPerRow - The number of frames per row
 * @param {number} totalFrames - The total number of frames
 * @param {number} animationSpeed - The speed of the animation
 * @param {boolean} autoPlay - Whether to auto play the animation
 * @param {boolean} pixelart - Whether to use pixel art
 * @param {boolean} useLighting - Whether to use lighting
 */
declare class InstancedTexture extends Drawable {
    instanceCount: number;
    instances: Instance[];
    instanceMatrices: Float32Array;
    instanceTexCoords: Float32Array;
    instanceMatrixBuffer: WebGLBuffer;
    instanceTexCoordBuffer: WebGLBuffer;
    instanceClickListeners: Map<string, Set<Function>>;
    instanceHoverListeners: Map<string, {
        enter: Set<Function>;
        leave: Set<Function>;
    }>;
    constructor(texturePath?: string, instanceCount?: number, frameWidth?: number, frameHeight?: number, framesPerRow?: number, totalFrames?: number, animationSpeed?: number, autoPlay?: boolean, pixelart?: boolean, useLighting?: boolean);
    /**
     * @method addInstance
     * @description Adds an instance to the instanced texture
     * @param {Instance} instance - The instance to add
     */
    addInstance(instance: Instance): void;
    /**
     * @method removeInstance
     * @description Removes an instance from the instanced texture
     * @param {string} instanceID - The ID of the instance to remove
     */
    removeInstance(instanceID: string): void;
    /**
     * @method clearInstances
     * @description Clears all instances from the instanced texture
     */
    clearInstances(): void;
    /**
     * @method updateInstanceCount
     * @description Updates the instance count of the instanced texture
     * @param {number} newCount - The new instance count
     */
    updateInstanceCount(newCount: number): void;
    /**
     * @method updateInstanceMatrix
     * @description Updates the transformation matrix for a specific instance
     * @param {number} index - The index of the instance to update
     */
    updateInstanceMatrix(index: number): void;
    /**
     * @method updateAllInstanceMatrices
     * @description Updates all instance matrices
     */
    updateAllInstanceMatrices(): void;
    /**
     * @method updateInstanceTexCoords
     * @description Updates the texture coordinates for a specific instance
     * @param {number} index - The index of the instance to update
     */
    updateInstanceTexCoords(index: number): void;
    /**
     * @method updateAllInstanceTexCoords
     * @description Updates all instance texture coordinates
     */
    updateAllInstanceTexCoords(): void;
    /**
     * @method getInstanceWithId
     * @description Gets an instance by its ID
     * @param {string} id - The ID of the instance to get
     * @returns {Instance} - The instance
     */
    getInstanceWithId(id: string): Instance | undefined;
    /**
     * @method update
     * @description Updates the instanced texture
     * @param {number} currentTime - The current time
     */
    update(currentTime: number): void;
    /**
     * @method animateInstance
     * @description Starts animation on a specific instance
     * @param {string} instanceId - The ID of the instance to animate
     * @param {Array} frames - The frames to animate
     * @param {number} speed - The speed of the animation
     */
    animateInstance(instanceId: string, frames: number[], speed?: number): void;
    /**
     * @method stopInstanceAnimation
     * @description Stops animation on a specific instance
     * @param {string} instanceId - The ID of the instance to stop animation
     * @param {boolean} revertToOriginal - Whether to revert to the original frame
     */
    stopInstanceAnimation(instanceId: string, revertToOriginal?: boolean): void;
    /**
     * @method addClickEventToAllInstances
     * @description Adds a click event to all instances
     * @param {function} func - The function to call when the instance is clicked
     */
    addClickEventToAllInstances(func: Function): void;
    /**
     * @method addHoverEventToAllInstances
     * @description Adds a hover event to all instances
     * @param {function} enterFunc - The function to call when the instance is hovered
     * @param {function} leaveFunc - The function to call when the instance is no longer hovered
     */
    addHoverEventToAllInstances(enterFunc: Function, leaveFunc: Function): void;
    /**
     * @method removeClickEventFromAllInstances
     * @description Removes a click event from all instances
     * @param {function} func - The function to remove
     */
    removeClickEventFromAllInstances(func: Function): void;
    /**
     * @method removeHoverEventFromAllInstances
     * @description Removes a hover event from all instances
     * @param {function} enterFunc - The function to remove
     * @param {function} leaveFunc - The function to remove
     */
    removeHoverEventFromAllInstances(enterFunc: Function, leaveFunc: Function): void;
    /**
     * @method getFrameTexCoords
     * @description Calculates the texture coordinates for a specific frame
     * @param {number} frame - The frame to calculate the texture coordinates for
     * @returns {Array} - The texture coordinates
     */
    getFrameTexCoords(frame: number): number[];
    /**
     * @method draw
     * @description Draws the instanced texture
     */
    draw(): void;
    /**
     * @method setInstanceFrame
     * @description Updates the frame of a specific instance
     * @param {string} instanceId - The ID of the instance to update
     * @param {number} frame - The frame to set
     */
    setInstanceFrame(instanceId: string, frame: number): void;
    /**
     * @method isPointInInstance
     * @description Checks if a point is inside a specific instance
     * @param {number} x - The x coordinate of the point
     * @param {number} y - The y coordinate of the point
     * @param {Instance} instance - The instance to check
     * @returns {boolean} - Whether the point is inside the instance
     */
    isPointInInstance(x: number, y: number, instance: Instance): boolean;
    /**
     * @method getInstanceAtPosition
     * @description Gets an instance at a specific position
     * @param {Vector3} position - The position to check
     * @param {number} tolerance - The tolerance for the position
     * @returns {Instance} - The instance at the position
     */
    getInstanceAtPosition(position: Vector3, tolerance?: number): Instance | undefined;
    /**
     * @method getInstanceByFrame
     * @description Gets an instance by its frame index
     * @param {number} frameIndex - The frame index to get
     * @returns {Instance} - The instance at the frame index
     */
    getInstanceByFrame(frameIndex: number): Instance | undefined;
    /**
     * @method getInstanceAtPoint
     * @description Gets an instance at a specific point
     * @param {number} x - The x coordinate of the point
     * @param {number} y - The y coordinate of the point
     * @returns {Instance} - The instance at the point
     */
    getInstanceAtPoint(x: number, y: number): Instance | undefined;
    /**
     * @method addInstanceClickEvent
     * @description Adds a click event listener to a specific instance
     * @param {string} instanceId - The ID of the instance to add the click event listener to
     * @param {function} func - The function to call when the instance is clicked
     */
    addInstanceClickEvent(instanceId: string, func: Function): void;
    /**
     * @method removeInstanceClickEvent
     * @description Removes a click event listener from a specific instance
     * @param {string} instanceId - The ID of the instance to remove the click event listener from
     * @param {function} func - The function to remove
     */
    removeInstanceClickEvent(instanceId: string, func: Function): void;
    /**
     * @method addInstanceHoverEvent
     * @description Adds a hover event listener to a specific instance
     * @param {string} instanceId - The ID of the instance to add the hover event listener to
     * @param {function} enterFunc - The function to call when the instance is hovered
     * @param {function} leaveFunc - The function to call when the instance is no longer hovered
     */
    addInstanceHoverEvent(instanceId: string, enterFunc: Function, leaveFunc: Function): void;
    /**
     * @method removeInstanceHoverEvent
     * @description Removes a hover event listener from a specific instance
     * @param {string} instanceId - The ID of the instance to remove the hover event listener from
     * @param {function} enterFunc - The function to remove
     * @param {function} leaveFunc - The function to remove
     */
    removeInstanceHoverEvent(instanceId: string, enterFunc: Function, leaveFunc: Function): void;
    /**
     * @method handleInstanceClick
     * @description Handles a click event for a specific instance
     * @param {Event} event - The event to handle
     * @param {number} x - The x coordinate of the click
     * @param {number} y - The y coordinate of the click
     */
    handleInstanceClick(event: Event, x: number, y: number): boolean;
    /**
     * @method handleInstanceHover
     * @description Handles a hover event for a specific instance
     * @param {Event} event - The event to handle
     * @param {number} x - The x coordinate of the hover
     * @param {number} y - The y coordinate of the hover
     * @param {Instance} lastHoveredInstance - The last hovered instance
     */
    handleInstanceHover(event: Event, x: number, y: number, lastHoveredInstance: Instance | undefined): Instance | undefined;
}
export default InstancedTexture;
//# sourceMappingURL=InstancedTexture.d.ts.map