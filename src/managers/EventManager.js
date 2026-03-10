import Scene from "../Scene.js";
import InstancedTexture from "../InstancedTexture.js";

/**
 * @class EventManager
 * @description Manages the events for the game
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Scene} scene - The scene
 * @param {Camera} camera - The camera
 */
class EventManager {
  constructor(canvas, scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.canvas = canvas;
    this.keyDownListeners = new Map();
    this.keyUpListeners = new Map();
    this.clickListeners = new Map();
    this.hoverListeners = new Map();
    this.lastHoveredObject = null;
    this.lastHoveredInstance = null;
    this.pressedKeys = new Map();
    this.mousePosition = { x: 0, y: 0 };
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    this.boundHandleClick = this.handleClick.bind(this);

    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);

    // Camera dragging state
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.initialCameraX = this.camera.transform.position.x;
    this.initialCameraY = this.camera.transform.position.y;
    this.cameraWasMoved = false;

    window.addEventListener("mousemove", this.boundHandleMouseMove);
    window.addEventListener("keydown", this.boundHandleKeyDown);
    window.addEventListener("keyup", this.boundHandleKeyUp);
    window.addEventListener("click", this.boundHandleClick);
    window.addEventListener("mousedown", this.boundHandleMouseDown);
    window.addEventListener("mouseup", this.boundHandleMouseUp);
  }
  
  /**
   * @method addKeyDown
   * @description Adds a key down event listener
   * @param {string} key - The key to listen for
   * @param {function} func - The function to call when the key is pressed
   */
  addKeyDown(key, func) {
    if (!this.keyDownListeners.has(key.length <= 1 ? key.toLowerCase() : key)) {
      this.keyDownListeners.set(
        key.length <= 1 ? key.toLowerCase() : key,
        new Set()
      );
    }
    this.keyDownListeners
      .get(key.length <= 1 ? key.toLowerCase() : key)
      .add(func);
  }

  /**
   * @method addKeyUp
   * @description Adds a key up event listener
   * @param {string} key - The key to listen for
   * @param {function} func - The function to call when the key is released
   */
  addKeyUp(key, func) {
    if (!this.keyUpListeners.has(key.length <= 1 ? key.toLowerCase() : key)) {
      this.keyUpListeners.set(
        key.length <= 1 ? key.toLowerCase() : key,
        new Set()
      );
    }
    this.keyUpListeners
      .get(key.length <= 1 ? key.toLowerCase() : key)
      .add(func);
  }

  /**
   * @method removeKeyDown
   * @description Removes a key down event listener
   * @param {string} key - The key to remove the listener for
   * @param {function} func - The function to remove
   */
  removeKeyDown(key, func) {
    if (this.keyDownListeners.has(key.length <= 1 ? key.toLowerCase() : key)) {
      this.keyDownListeners
        .get(key.length <= 1 ? key.toLowerCase() : key)
        .delete(func);
    }
  }

  /**
   * @method removeKeyUp
   * @description Removes a key up event listener
   * @param {string} key - The key to remove the listener for
   * @param {function} func - The function to remove
   */
  removeKeyUp(key, func) {
    if (this.keyUpListeners.has(key.length <= 1 ? key.toLowerCase() : key)) {
      this.keyUpListeners
        .get(key.length <= 1 ? key.toLowerCase() : key)
        .delete(func);
    }
  }

  /**
   * @method handleKeyDown
   * @description Handles a key down event
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyDown(event) {
    this.pressedKeys.set(
      event.key.length <= 1 ? event.key.toLowerCase() : event.key,
      true
    );
    const listeners = this.keyDownListeners.get(
      event.key.length <= 1 ? event.key.toLowerCase() : event.key
    );
    if (listeners) {
      listeners.forEach((func) => func(event));
    }
  }

  /**
   * @method handleKeyUp
   * @description Handles a key up event
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyUp(event) {
    this.pressedKeys.set(
      event.key.length <= 1 ? event.key.toLowerCase() : event.key,
      false
    );
    const listeners = this.keyUpListeners.get(
      event.key.length <= 1 ? event.key.toLowerCase() : event.key
    );
    if (listeners) {
      listeners.forEach((func) => func(event));
    }
  }

  /**
   * @method isKeyPressed
   * @description Checks if a key is pressed
   * @param {string} key - The key to check
   * @returns {boolean} - True if the key is pressed
   */
  isKeyPressed(key) {
    return (
      this.pressedKeys.get(key.length <= 1 ? key.toLowerCase() : key) || false
    );
  }

  /**
   * @method addClickEvent
   * @description Adds a click event listener
   * @param {GameObject} object - The object to listen for
   * @param {function} func - The function to call when the object is clicked
   */
  addClickEvent(object, func) {
    if (!this.clickListeners.has(object.id)) {
      this.clickListeners.set(object.id, new Set());
    }
    this.clickListeners.get(object.id).add(func);
  }

  /**
   * @method handleClick
   * @description Handles a click event
   * @param {MouseEvent} event - The mouse event
   */
  handleClick(event) {
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();

    // Calculate click position relative to the canvas
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Convert to world coordinates
    const worldX =
      canvasX - this.canvas.width / 2 - this.camera.transform.position.x;
    const worldY =
      this.canvas.height / 2 - canvasY - this.camera.transform.position.y;

    this.scene.objects.forEach((sceneObject) => {
      if (!sceneObject.isActive) return; // Skip inactive objects
      // Check if the object has an InstancedTexture component
      let instanceHandled = false;
      if (
        sceneObject.getComponent &&
        sceneObject.getComponent(InstancedTexture)
      ) {
        const instancedTexture = sceneObject.getComponent(InstancedTexture);
        instanceHandled = instancedTexture.handleInstanceClick(
          event,
          worldX,
          worldY
        );
      }

      // If no instance handled the click, check the object itself
      if (
        !instanceHandled &&
        this.isPointInObject(worldX, worldY, sceneObject)
      ) {
        const listeners = this.clickListeners.get(sceneObject.id);
        if (listeners) {
          listeners.forEach((func) => func(event, sceneObject));
        }
      }
      
    });
  }

  /**
   * @method removeClickEvent
   * @description Removes a click event listener
   * @param {GameObject} object - The object to remove the listener for
   * @param {function} func - The function to remove
   */
  removeClickEvent(object, func) {
    if (this.clickListeners.has(object.id)) {
      this.clickListeners.get(object.id).delete(func);
    }
  }

  /**
   * @method isPointInObject
   * @description Checks if a point is in an object
   * @param {number} x - The x coordinate of the point
   * @param {number} y - The y coordinate of the point
   * @param {GameObject} object - The object to check
   * @returns {boolean} - True if the point is in the object
   */
  isPointInObject(x, y, object) {
    const left = object.transform.position.x - object.transform.scale.x;
    const right = object.transform.position.x + object.transform.scale.x;
    const top = object.transform.position.y + object.transform.scale.y;
    const bottom = object.transform.position.y - object.transform.scale.y;
    return x >= left && x <= right && y >= bottom && y <= top;
  }

  /**
   * @method addHoverEvent
   * @description Adds a hover event listener
   * @param {GameObject} object - The object to listen for
   * @param {function} enterFunc - The function to call when the object is hovered
   * @param {function} leaveFunc - The function to call when the object is no longer hovered
   */
  addHoverEvent(object, enterFunc, leaveFunc) {
    if (!this.hoverListeners.has(object.id)) {
      this.hoverListeners.set(object.id, {
        enter: new Set(),
        leave: new Set(),
      });
    }
    this.hoverListeners.get(object.id).enter.add(enterFunc);
    this.hoverListeners.get(object.id).leave.add(leaveFunc);
  }

  /**
   * @method removeHoverEvent
   * @description Removes a hover event listener
   * @param {GameObject} object - The object to remove the listener for
   * @param {function} enterFunc - The function to remove
   * @param {function} leaveFunc - The function to remove
   */
  removeHoverEvent(object, enterFunc, leaveFunc) {
    if (this.hoverListeners.has(object.id)) {
      const listeners = this.hoverListeners.get(object.id);
      listeners.enter.delete(enterFunc);
      listeners.leave.delete(leaveFunc);
    }
  }

  /**
   * @method handleMouseDown
   * @description Handles a mouse down event
   * @param {MouseEvent} event - The mouse event
   */
  handleMouseDown(event) {
    if (event.button === 1) {
      event.preventDefault();
      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.initialCameraX = this.camera.transform.position.x;
      this.initialCameraY = this.camera.transform.position.y;
      this.canvas.style.cursor = "grabbing";
    }
  }

  /**
   * @method handleMouseUp
   * @description Handles a mouse up event
   * @param {MouseEvent} event - The mouse event
   */
  handleMouseUp(event) {
    if (event.button === 1 && this.isDragging) {
      this.isDragging = false;
      this.canvas.style.cursor = "default";
      this.cameraWasMoved = true;
    }
  }

  /**
   * @method handleMouseMove
   * @description Handles a mouse move event
   * @param {MouseEvent} event - The mouse event
   */
  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();

    // Calculate mouse position relative to the canvas
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Convert to world coordinates
    const worldX =
      canvasX - this.canvas.width / 2 - this.camera.transform.position.x;
    const worldY =
      this.canvas.height / 2 - canvasY - this.camera.transform.position.y;
    this.mousePosition.x = worldX;
    this.mousePosition.y = worldY;
    let hoveredObject = null;
    let hoveredInstance = null;

    this.scene.objects.forEach((sceneObject) => {
      if (!sceneObject.isActive) return; // Skip inactive objects

      // Check if the object has an InstancedTexture component
      if (
        sceneObject.getComponent &&
        sceneObject.getComponent(InstancedTexture)
      ) {
        const instancedTexture = sceneObject.getComponent(InstancedTexture);
        const instanceAtPoint = instancedTexture.getInstanceAtPoint(
          worldX,
          worldY
        );
        if (instanceAtPoint) {
          hoveredInstance = instanceAtPoint;
          hoveredObject = sceneObject; // Also set the parent object as hovered
        }
      }

      // If no instance was hovered, check the object itself
      if (
        !hoveredInstance &&
        this.isPointInObject(worldX, worldY, sceneObject)
      ) {
        hoveredObject = sceneObject;
      } 
    });

    // Handle instance hover events
    if (hoveredInstance !== this.lastHoveredInstance) {
      if (this.lastHoveredInstance) {
        const parent = this.lastHoveredInstance.parent;
        if (parent && parent instanceof InstancedTexture) {
          parent.handleInstanceHover(
            event,
            worldX,
            worldY,
            this.lastHoveredInstance
          );
        }
      }

      if (hoveredInstance) {
        const parent = hoveredInstance.parent;
        if (parent && parent instanceof InstancedTexture) {
          parent.handleInstanceHover(
            event,
            worldX,
            worldY,
            this.lastHoveredInstance
          );
        }
      }

      this.lastHoveredInstance = hoveredInstance;
    }

    // Handle object hover events
    if (hoveredObject !== this.lastHoveredObject) {
      // Always trigger leave event if we had a previously hovered object
      if (this.lastHoveredObject && this.lastHoveredObject.isActive) {
        const leaveListeners = this.hoverListeners.get(
          this.lastHoveredObject.id
        );
        if (leaveListeners) {
          leaveListeners.leave.forEach((func) =>
            func(event, this.lastHoveredObject)
          );
        }
      }

      // Only trigger enter event if we're not hovering over an instance
      if (hoveredObject && hoveredObject.isActive && !hoveredInstance) {
        const enterListeners = this.hoverListeners.get(hoveredObject.id);
        if (enterListeners) {
          enterListeners.enter.forEach((func) => func(event, hoveredObject));
        }
      }

      this.lastHoveredObject = hoveredObject;
    }
  }

  /**
   * @method getMousePosition
   * @description Returns the mouse position
   * @returns {Object} - The mouse position
   */
  getMousePosition() {
    return this.mousePosition;
  }

  /**
   * @method wasCameraMoved
   * @description Checks if the camera was moved
   * @returns {boolean} - True if the camera was moved
   */
  wasCameraMoved() {
    return this.cameraWasMoved;
  }

  /**
   * @method resetCameraMoved
   * @description Resets the camera moved flag
   */
  resetCameraMoved() {
    this.cameraWasMoved = false;
  }

  /**
   * @method changeScene
   * @description Changes the scene
   * @param {Scene} scene - The scene to change to
   */
  changeScene(scene) {
    if (scene instanceof Scene) {
      this.scene = scene;
    } else {
      console.error(
        "[EventManager] > Specified argument is not an instance of Scene class"
      );
    }
  }

  /**
   * @method clean
   * @description Cleans up the event manager
   */
  clean() {
    window.removeEventListener("mousemove", this.boundHandleMouseMove);
    window.removeEventListener("keydown", this.boundHandleKeyDown);
    window.removeEventListener("keyup", this.boundHandleKeyUp);
    window.removeEventListener("click", this.boundHandleClick);
    window.removeEventListener("mousedown", this.boundHandleMouseDown);
    window.removeEventListener("mouseup", this.boundHandleMouseUp);
    this.pressedKeys.clear();
    this.keyDownListeners.clear();
    this.lastHoveredObject = null;
    this.lastHoveredInstance = null;
  }
}

export default EventManager;
