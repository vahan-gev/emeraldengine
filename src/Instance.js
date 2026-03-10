import RigidBody from "./components/RigidBody.js";
import IDManager from "./managers/IDManager.js";
import { Vector2, Vector3 } from "./Physics.js";
import Transform from "./Transform.js";

/**
 * @class Instance
 * @description Represents an instance
 * @param {string} name - The name of the instance
 * @param {Vector3} position - The position of the instance
 * @param {Vector2} scale - The scale of the instance
 * @param {number} rotation - The rotation of the instance
 * @param {number} frame - The frame of the instance
 */
class Instance {
  constructor(
    name,
    position = new Vector3(0, 0, 0),
    scale = new Vector2(1, 1),
    rotation = 0,
    frame = 0
  ) {
    this.name = name;
    this.transform = new Transform(position, rotation, scale);
    this.id = IDManager.generateUniqueID();
    this.parent = null;
    this.frame = frame;

    // Animation properties
    this.isAnimating = false;
    this.animationFrames = [];
    this.currentAnimationIndex = 0;
    this.animationSpeed = 1000;
    this.lastFrameTime = 0;
    this.playOnce = false;
    this.originalFrame = frame;

    // Components
    this.components = [];
  }

  /**
   * @method setParent
   * @description Sets the parent of the instance
   * @param {Instance} parent - The parent of the instance
   */
  setParent(parent) {
    this.parent = parent;
  }

  /**
   * @method playAnimation
   * @description Plays an animation with an array of frames
   * @param {Array} frames - The frames to play
   * @param {number} speed - The speed of the animation
   */
  playAnimation(frames, speed = 1000) {
    if (frames.length === 0) {
      console.error("Animation frames cannot be empty!");
      return;
    }

    this.animationFrames = frames;
    this.animationSpeed = speed;
    this.currentAnimationIndex = 0;
    this.isAnimating = true;
    this.playOnce = false;
    this.lastFrameTime = 0;
  }

  /**
   * @method playAnimationOnce
   * @description Plays an animation with an array of frames once then stops
   * @param {Array} frames - The frames to play
   * @param {number} speed - The speed of the animation
   */
  playAnimationOnce(frames, speed = 1000) {
    if (frames.length === 0) {
      console.error("Animation frames cannot be empty!");
      return;
    }

    this.animationFrames = frames;
    this.animationSpeed = speed;
    this.currentAnimationIndex = 0;
    this.isAnimating = true;
    this.playOnce = true;
    this.lastFrameTime = 0;
  }

  /**
   * @method stopAnimation
   * @description Stops the animation and optionally reverts to the original frame
   * @param {boolean} revertToOriginal - Whether to revert to the original frame
   */
  stopAnimation(revertToOriginal = false) {
    this.isAnimating = false;
    this.animationFrames = [];
    this.currentAnimationIndex = 0;

    if (revertToOriginal) {
      this.frame = this.originalFrame;
    }
  }

  /**
   * @method setFrame
   * @description Sets a specific frame
   * @param {number} frame - The frame to set
   */
  setFrame(frame) {
    this.frame = frame;
    this.isAnimating = false;
  }

  /**
   * @method updateAnimation
   * @description Updates the animation
   * @param {number} currentTime - The current time
   */
  updateAnimation(currentTime) {
    if (!this.isAnimating || this.animationFrames.length === 0) {
      return false;
    }

    if (currentTime - this.lastFrameTime >= this.animationSpeed) {
      this.frame = this.animationFrames[this.currentAnimationIndex];
      this.currentAnimationIndex++;

      if (this.currentAnimationIndex >= this.animationFrames.length) {
        if (this.playOnce) {
          this.stopAnimation();
        } else {
          this.currentAnimationIndex = 0; // Loop animation
        }
      }

      this.lastFrameTime = currentTime;
      return true; // Frame changed
    }

    return false; // No frame change
  }

  /**
   * @method addComponent
   * @description Adds a component to the instance
   * @param {Component} componentInstance - The component to add
   */
  addComponent(componentInstance) {
    const componentType = componentInstance.constructor;
    if (this.components.some((comp) => comp instanceof componentType)) {
      throw new Error(
        `Component ${componentType.name} already exists in ${this.name}`
      );
    }

    this.components.push(componentInstance);
    componentInstance.setParent(this);
  }

  /**
   * @method removeComponent
   * @description Removes a component from the instance
   * @param {Component} component - The component to remove
   */
  removeComponent(component) {
    if (component instanceof RigidBody) {
      component.destroy();
    }
    this.components = this.components.filter(
      (comp) => comp.id !== component.id
    );
  }

  /**
   * @method getComponent
   * @description Gets a component from the instance
   * @param {Component} componentType - The type of the component to get
   * @returns {Component} - The component
   */
  getComponent(componentType) {
    return this.components.find((comp) => comp instanceof componentType);
  }
}

export default Instance;
