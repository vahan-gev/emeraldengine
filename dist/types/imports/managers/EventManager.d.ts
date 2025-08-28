import Scene from "../Scene";
import GameObject from "../components/GameObject";
import Instance from "../Instance";
/**
 * @class EventManager
 * @description Manages the events for the game
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Scene} scene - The scene
 * @param {Camera} camera - The camera
 */
declare class EventManager {
    scene: Scene;
    camera: any;
    canvas: HTMLCanvasElement;
    keyDownListeners: Map<string, Set<Function>>;
    keyUpListeners: Map<string, Set<Function>>;
    clickListeners: Map<string, Set<Function>>;
    canvasWidth: number;
    canvasHeight: number;
    hoverListeners: Map<string, {
        enter: Set<Function>;
        leave: Set<Function>;
    }>;
    lastHoveredObject: GameObject | null;
    lastHoveredInstance: Instance | null;
    pressedKeys: Map<string, boolean>;
    mousePosition: {
        x: number;
        y: number;
    };
    isDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    initialCameraX: number;
    initialCameraY: number;
    cameraWasMoved: boolean;
    boundHandleMouseMove: (event: MouseEvent) => void;
    boundHandleKeyDown: (event: KeyboardEvent) => void;
    boundHandleKeyUp: (event: KeyboardEvent) => void;
    boundHandleClick: (event: MouseEvent) => void;
    boundHandleMouseDown: (event: MouseEvent) => void;
    boundHandleMouseUp: (event: MouseEvent) => void;
    constructor(canvas: HTMLCanvasElement, scene: Scene, camera: any);
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
    getMousePosition(): {
        x: number;
        y: number;
    };
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
export default EventManager;
//# sourceMappingURL=EventManager.d.ts.map