export default EventManager;
/**
 * @class EventManager
 * @description Manages the events for the game
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Scene} scene - The scene
 * @param {Camera} camera - The camera
 */
declare class EventManager {
    constructor(canvas: any, scene: any, camera: any);
    scene: any;
    camera: any;
    canvas: any;
    keyDownListeners: Map<any, any>;
    keyUpListeners: Map<any, any>;
    clickListeners: Map<any, any>;
    hoverListeners: Map<any, any>;
    lastHoveredObject: any;
    lastHoveredInstance: any;
    pressedKeys: Map<any, any>;
    mousePosition: {
        x: number;
        y: number;
    };
    boundHandleMouseMove: any;
    boundHandleKeyDown: any;
    boundHandleKeyUp: any;
    boundHandleClick: any;
    boundHandleMouseDown: any;
    boundHandleMouseUp: any;
    isDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    initialCameraX: any;
    initialCameraY: any;
    cameraWasMoved: boolean;
    /**
     * @method addKeyDown
     * @description Adds a key down event listener
     * @param {string} key - The key to listen for
     * @param {function} func - The function to call when the key is pressed
     */
    addKeyDown(key: string, func: Function): void;
    /**
     * @method addKeyUp
     * @description Adds a key up event listener
     * @param {string} key - The key to listen for
     * @param {function} func - The function to call when the key is released
     */
    addKeyUp(key: string, func: Function): void;
    /**
     * @method removeKeyDown
     * @description Removes a key down event listener
     * @param {string} key - The key to remove the listener for
     * @param {function} func - The function to remove
     */
    removeKeyDown(key: string, func: Function): void;
    /**
     * @method removeKeyUp
     * @description Removes a key up event listener
     * @param {string} key - The key to remove the listener for
     * @param {function} func - The function to remove
     */
    removeKeyUp(key: string, func: Function): void;
    /**
     * @method handleKeyDown
     * @description Handles a key down event
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyDown(event: KeyboardEvent): void;
    /**
     * @method handleKeyUp
     * @description Handles a key up event
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyUp(event: KeyboardEvent): void;
    /**
     * @method isKeyPressed
     * @description Checks if a key is pressed
     * @param {string} key - The key to check
     * @returns {boolean} - True if the key is pressed
     */
    isKeyPressed(key: string): boolean;
    /**
     * @method addClickEvent
     * @description Adds a click event listener
     * @param {GameObject} object - The object to listen for
     * @param {function} func - The function to call when the object is clicked
     */
    addClickEvent(object: GameObject, func: Function): void;
    /**
     * @method screenToWorld
     * @description Converts screen (client) coordinates to world coordinates,
     * accounting for camera position, zoom, and CSS/backing pixel ratio.
     * @param {number} clientX - The clientX of the pointer
     * @param {number} clientY - The clientY of the pointer
     * @returns {{x: number, y: number}} - The world-space coordinates
     */
    screenToWorld(clientX: number, clientY: number): {
        x: number;
        y: number;
    };
    /**
     * @method getTopObjectAt
     * @description Returns the topmost active object under a world-space point
     * along with the instance hit (if the object is an InstancedTexture). Topmost
     * means highest z, with later scene order breaking ties — matching draw order.
     * @param {number} worldX - The world-space x coordinate
     * @param {number} worldY - The world-space y coordinate
     * @returns {{object: GameObject, instance: Instance|null}|null}
     */
    getTopObjectAt(worldX: number, worldY: number): {
        object: GameObject;
        instance: Instance | null;
    } | null;
    /**
     * @method handleClick
     * @description Handles a click event
     * @param {MouseEvent} event - The mouse event
     */
    handleClick(event: MouseEvent): void;
    /**
     * @method removeClickEvent
     * @description Removes a click event listener
     * @param {GameObject} object - The object to remove the listener for
     * @param {function} func - The function to remove
     */
    removeClickEvent(object: GameObject, func: Function): void;
    /**
     * @method isPointInObject
     * @description Checks if a point is in an object
     * @param {number} x - The x coordinate of the point
     * @param {number} y - The y coordinate of the point
     * @param {GameObject} object - The object to check
     * @returns {boolean} - True if the point is in the object
     */
    isPointInObject(x: number, y: number, object: GameObject): boolean;
    /**
     * @method addHoverEvent
     * @description Adds a hover event listener
     * @param {GameObject} object - The object to listen for
     * @param {function} enterFunc - The function to call when the object is hovered
     * @param {function} leaveFunc - The function to call when the object is no longer hovered
     */
    addHoverEvent(object: GameObject, enterFunc: Function, leaveFunc: Function): void;
    /**
     * @method removeHoverEvent
     * @description Removes a hover event listener
     * @param {GameObject} object - The object to remove the listener for
     * @param {function} enterFunc - The function to remove
     * @param {function} leaveFunc - The function to remove
     */
    removeHoverEvent(object: GameObject, enterFunc: Function, leaveFunc: Function): void;
    /**
     * @method handleMouseDown
     * @description Handles a mouse down event
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseDown(event: MouseEvent): void;
    /**
     * @method handleMouseUp
     * @description Handles a mouse up event
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseUp(event: MouseEvent): void;
    /**
     * @method handleMouseMove
     * @description Handles a mouse move event
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseMove(event: MouseEvent): void;
    /**
     * @method getMousePosition
     * @description Returns the mouse position
     * @returns {Object} - The mouse position
     */
    getMousePosition(): any;
    /**
     * @method wasCameraMoved
     * @description Checks if the camera was moved
     * @returns {boolean} - True if the camera was moved
     */
    wasCameraMoved(): boolean;
    /**
     * @method resetCameraMoved
     * @description Resets the camera moved flag
     */
    resetCameraMoved(): void;
    /**
     * @method changeScene
     * @description Changes the scene
     * @param {Scene} scene - The scene to change to
     */
    changeScene(scene: Scene): void;
    /**
     * @method clean
     * @description Cleans up the event manager
     */
    clean(): void;
}
import Scene from "../Scene.js";
