import { initVertexBuffer, initInstancedBuffer } from "./GLUtils.js";
import Instance from "./Instance.js";
import Drawable from "./Drawable.js";
import { mat4 } from "gl-matrix";
import GLManager from "./managers/GLManager.js";
import RigidBody from "./components/RigidBody.js";
import Collider from "./components/Collider.js";

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
class InstancedTexture extends Drawable {
  constructor(
    texturePath = {},
    instanceCount = 1,
    frameWidth = 0,
    frameHeight = 0,
    framesPerRow = 1,
    totalFrames = 1,
    animationSpeed = 1000,
    autoPlay = true,
    pixelart = true,
    useLighting = true
  ) {
    const vertices = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    const verticesBuffer = initVertexBuffer(GLManager.getGL(), vertices);
    const textureCoordinates = [
      1.0,
      1.0, // Top-right
      0.0,
      1.0, // Top-left
      1.0,
      0.0, // Bottom-right
      0.0,
      0.0, // Bottom-left
    ];
    const texCoordBuffer = initVertexBuffer(
      GLManager.getGL(),
      textureCoordinates
    );

    super(
      GLManager.getGL(),
      GLManager.getProgramInfo(),
      verticesBuffer,
      texCoordBuffer,
      vertices,
      true,
      texturePath,
      frameWidth,
      frameHeight,
      framesPerRow,
      totalFrames,
      animationSpeed,
      autoPlay,
      pixelart,
      useLighting
    );

    this.instanceCount = instanceCount;

    this.instances = [];
    this.instanceMatrices = new Float32Array(instanceCount * 16); // 4x4 matrix for each instance
    this.instanceTexCoords = new Float32Array(instanceCount * 8); // 4 vertices * 2 coords per instance

    // Create instanced buffer for matrices
    this.instanceMatrixBuffer = initInstancedBuffer(
      GLManager.getGL(),
      this.instanceMatrices,
      16
    );

    // Create instanced buffer for texture coordinates
    this.instanceTexCoordBuffer = initInstancedBuffer(
      GLManager.getGL(),
      this.instanceTexCoords,
      8
    );

    // Event handling for instances
    this.instanceClickListeners = new Map();
    this.instanceHoverListeners = new Map();
  }

  /**
   * @method addInstance
   * @description Adds an instance to the instanced texture
   * @param {Instance} instance - The instance to add
   */
  addInstance(instance) {
    if (!(instance instanceof Instance)) {
      console.error("Instance must be an instance of the Instance class.");
      return;
    }

    if (this.instances.length < this.instanceCount) {
      this.instances.push(instance);
      instance.setParent(this);
    } else {
      console.warn("Max instance count reached.");
    }
  }

  /**
   * @method removeInstance
   * @description Removes an instance from the instanced texture
   * @param {string} instanceID - The ID of the instance to remove
   */
  removeInstance(instanceID) {
    const index = this.instances.findIndex(
      (instance) => instance.id === instanceID
    );
    if (index !== -1) {
      this.instances.splice(index, 1);

      // Clean up event listeners for this instance
      this.instanceClickListeners.delete(instanceID);
      this.instanceHoverListeners.delete(instanceID);

      this.instanceMatrices = new Float32Array(this.instanceCount * 16);
      this.instanceTexCoords = new Float32Array(this.instanceCount * 8);

      // Update instance matrices and texture coordinates
      this.updateAllInstanceMatrices();
      this.updateAllInstanceTexCoords();
    } else {
      console.warn("Instance not found:", instanceID);
    }
  }

  /**
   * @method clearInstances
   * @description Clears all instances from the instanced texture
   */
  clearInstances() {
    this.instances = [];

    // Clear all event listeners
    this.instanceClickListeners.clear();
    this.instanceHoverListeners.clear();

    this.instanceMatrices = new Float32Array(this.instanceCount * 16); // Reset matrices
    this.instanceTexCoords = new Float32Array(this.instanceCount * 8); // Reset texture coordinates

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceMatrixBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.instanceMatrices,
      this.gl.DYNAMIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceTexCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.instanceTexCoords,
      this.gl.DYNAMIC_DRAW
    );
  }

  /**
   * @method updateInstanceCount
   * @description Updates the instance count of the instanced texture
   * @param {number} newCount - The new instance count
   */
  updateInstanceCount(newCount) {
    this.instanceCount = newCount;
    this.instanceMatrices = new Float32Array(newCount * 16);
    this.instanceTexCoords = new Float32Array(newCount * 8);
    this.instanceMatrixBuffer = initInstancedBuffer(
      this.gl,
      this.instanceMatrices,
      16
    );
    this.instanceTexCoordBuffer = initInstancedBuffer(
      this.gl,
      this.instanceTexCoords,
      8
    );
  }

  /**
   * @method updateInstanceMatrix
   * @description Updates the transformation matrix for a specific instance
   * @param {number} index - The index of the instance to update
   */
  updateInstanceMatrix(index) {
    if (index >= 0 && index < this.instanceCount) {
      const matrix = mat4.create();
      const position = [
        this.instances[index].transform.position.x,
        this.instances[index].transform.position.y,
        this.instances[index].transform.position.z,
      ];
      const scale = [
        this.instances[index].transform.scale.x,
        this.instances[index].transform.scale.y,
        1,
      ];
      const rotation = this.instances[index].transform.rotation;

      mat4.translate(matrix, matrix, position);
      mat4.rotate(matrix, matrix, 0, [1, 0, 0]);
      mat4.rotate(matrix, matrix, 0, [0, 1, 0]);
      mat4.rotate(matrix, matrix, rotation, [0, 0, 1]);
      mat4.scale(matrix, matrix, scale);

      // Copy matrix values to the appropriate place in instanceMatrices
      const offset = index * 16;
      for (let i = 0; i < 16; i++) {
        this.instanceMatrices[offset + i] = matrix[i];
      }
    }
  }

  /**
   * @method updateAllInstanceMatrices
   * @description Updates all instance matrices
   */
  updateAllInstanceMatrices() {
    for (let i = 0; i < this.instances.length; i++) {
      this.updateInstanceMatrix(i);
    }

    // Update the instance buffer with new matrices
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceMatrixBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.instanceMatrices,
      this.gl.DYNAMIC_DRAW
    );

    // Also update texture coordinates
    this.updateAllInstanceTexCoords();
  }

  /**
   * @method updateInstanceTexCoords
   * @description Updates the texture coordinates for a specific instance
   * @param {number} index - The index of the instance to update
   */
  updateInstanceTexCoords(index) {
    if (
      index >= 0 &&
      index < this.instanceCount &&
      index < this.instances.length
    ) {
      const frame = this.instances[index].frame;
      const texCoords = this.getFrameTexCoords(frame);

      const offset = index * 8;
      for (let i = 0; i < 8; i++) {
        this.instanceTexCoords[offset + i] = texCoords[i];
      }
    }
  }

  /**
   * @method updateAllInstanceTexCoords
   * @description Updates all instance texture coordinates
   */
  updateAllInstanceTexCoords() {
    for (let i = 0; i < this.instances.length; i++) {
      this.updateInstanceTexCoords(i);
    }

    // Update the instance texture coordinate buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceTexCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.instanceTexCoords,
      this.gl.DYNAMIC_DRAW
    );
  }

  /**
   * @method getInstanceWithId
   * @description Gets an instance by its ID
   * @param {string} id - The ID of the instance to get
   * @returns {Instance} - The instance
   */
  getInstanceWithId(id) {
    return this.instances.find((instance) => instance.id === id);
  }

  /**
   * @method update
   * @description Updates the instanced texture
   * @param {number} currentTime - The current time
   */
  update(currentTime) {
    let needsUpdate = false;

    // Update animations for all instances
    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      if (instance.updateAnimation(currentTime)) {
        needsUpdate = true;
      }
    }

    // If any instance frame changed, update texture coordinates
    if (needsUpdate) {
      this.updateAllInstanceTexCoords();
    }
  }

  /**
   * @method animateInstance
   * @description Starts animation on a specific instance
   * @param {string} instanceId - The ID of the instance to animate
   * @param {Array} frames - The frames to animate
   * @param {number} speed - The speed of the animation
   */
  animateInstance(instanceId, frames, speed = 1000) {
    const instance = this.getInstanceWithId(instanceId);
    if (instance) {
      instance.playAnimation(frames, speed);
    } else {
      console.warn(`Instance with ID ${instanceId} not found`);
    }
  }

  /**
   * @method stopInstanceAnimation
   * @description Stops animation on a specific instance
   * @param {string} instanceId - The ID of the instance to stop animation
   * @param {boolean} revertToOriginal - Whether to revert to the original frame
   */
  stopInstanceAnimation(instanceId, revertToOriginal = false) {
    const instance = this.getInstanceWithId(instanceId);
    if (instance) {
      instance.stopAnimation(revertToOriginal);
    } else {
      console.warn(`Instance with ID ${instanceId} not found`);
    }
  }

  /**
   * @method addClickEventToAllInstances
   * @description Adds a click event to all instances
   * @param {function} func - The function to call when the instance is clicked
   */
  addClickEventToAllInstances(func) {
    this.instances.forEach((instance) => {
      this.addInstanceClickEvent(instance.id, func);
    });
  }

  /**
   * @method addHoverEventToAllInstances
   * @description Adds a hover event to all instances
   * @param {function} enterFunc - The function to call when the instance is hovered
   * @param {function} leaveFunc - The function to call when the instance is no longer hovered
   */
  addHoverEventToAllInstances(enterFunc, leaveFunc) {
    this.instances.forEach((instance) => {
      this.addInstanceHoverEvent(instance.id, enterFunc, leaveFunc);
    });
  }

  /**
   * @method removeClickEventFromAllInstances
   * @description Removes a click event from all instances
   * @param {function} func - The function to remove
   */
  removeClickEventFromAllInstances(func) {
    this.instances.forEach((instance) => {
      this.removeInstanceClickEvent(instance.id, func);
    });
  }

  /**
   * @method removeHoverEventFromAllInstances
   * @description Removes a hover event from all instances
   * @param {function} enterFunc - The function to remove
   * @param {function} leaveFunc - The function to remove
   */
  removeHoverEventFromAllInstances(enterFunc, leaveFunc) {
    this.instances.forEach((instance) => {
      this.removeInstanceHoverEvent(instance.id, enterFunc, leaveFunc);
    });
  }

  /**
   * @method getFrameTexCoords
   * @description Calculates the texture coordinates for a specific frame
   * @param {number} frame - The frame to calculate the texture coordinates for
   * @returns {Array} - The texture coordinates
   */
  getFrameTexCoords(frame) {
    let texLeft, texRight, texTop, texBottom;

    if (this.frameWidth > 0 && this.frameHeight > 0) {
      // Spritesheet animation
      const col = frame % this.framesPerRow;
      const row = Math.floor(frame / this.framesPerRow);

      const halfTexelWidth = 0.5 / this.textureWidth;
      const halfTexelHeight = 0.5 / this.textureHeight;

      texLeft = ((col + 1) * this.frameWidth) / this.textureWidth - halfTexelWidth;
      texRight = (col * this.frameWidth) / this.textureWidth + halfTexelWidth;
      texTop =
        (this.textureHeight - row * this.frameHeight - this.frameHeight) /
          this.textureHeight +
        halfTexelHeight;
      texBottom =
        (this.textureHeight - row * this.frameHeight) / this.textureHeight -
        halfTexelHeight;
    } else {
      // Static image
      texLeft = 1.0;
      texRight = 0.0;
      texTop = 0.0;
      texBottom = 1.0;
    }

    // Return texture coordinates (considering mirroring)
    return this.mirrored
      ? [
          texRight,
          texBottom,
          texLeft,
          texBottom,
          texRight,
          texTop,
          texLeft,
          texTop,
        ]
      : [
          texLeft,
          texBottom,
          texRight,
          texBottom,
          texLeft,
          texTop,
          texRight,
          texTop,
        ];
  }

  /**
   * @method draw
   * @description Draws the instanced texture
   */
  draw() {
    this.updateAllInstanceMatrices();
    this.update(performance.now());
    for (let i = 0; i < this.instances.length; i++) {
      let instance = this.instances[i];
      let rigidBody = instance.getComponent(RigidBody);
      let collider = instance.getComponent(Collider);

      if (rigidBody) {
        if (rigidBody.getType() === "dynamic") {
          const updatedPos = rigidBody.getBody().getPosition();
          const rigidBodyOffset = rigidBody.getOffset();
          instance.transform.position.x =
            updatedPos.x * rigidBody.getPhysics().getScale() -
            rigidBodyOffset.x;
          instance.transform.position.y =
            updatedPos.y * rigidBody.getPhysics().getScale() -
            rigidBodyOffset.y;
          if (collider) {
            collider.debugShape.gameObject.transform.position.x =
              instance.transform.position.x;
            collider.debugShape.gameObject.transform.position.y =
              instance.transform.position.y;
          }
        }
      }
    }
    this.gl.uniform1i(
      this.programInfo.uniformLocations.useTexture,
      this.useTexture
    );

    this.gl.uniform1i(this.programInfo.uniformLocations.useInstances, true);

    // Set lighting uniform
    this.gl.uniform1i(
      this.programInfo.uniformLocations.useLighting,
      this.useLighting
    );

    // Always set the color uniform for tinting
    this.gl.uniform4fv(this.programInfo.uniformLocations.color, this.color);

    // Set per-GameObject opacity if available (defaults to 1.0)
    const ownerGameObject = this.getParent();
    const ownerOpacity =
      ownerGameObject && typeof ownerGameObject.opacity === "number"
        ? ownerGameObject.opacity
        : 1.0;
    if (this.programInfo.uniformLocations.uOpacity) {
      this.gl.uniform1f(
        this.programInfo.uniformLocations.uOpacity,
        ownerOpacity
      );
    }

    // Bind and set vertex position buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.verticesBuffer);
    this.gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(
      this.programInfo.attribLocations.vertexPosition
    );

    // Bind and set texture coordinate buffer (for non-instanced rendering)
    if (this.useTexture) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
      this.gl.vertexAttribPointer(
        this.programInfo.attribLocations.aTexCoord,
        2,
        this.gl.FLOAT,
        false,
        0,
        0
      );
      this.gl.enableVertexAttribArray(
        this.programInfo.attribLocations.aTexCoord
      );

      if (this.texture) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      }

      // Set up per-instance texture coordinate attributes
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceTexCoordBuffer);

      // Each instance has 4 texture coordinates (for 4 vertices)
      const texCoordAttribs = [
        this.programInfo.attribLocations.instanceTexCoord0,
        this.programInfo.attribLocations.instanceTexCoord1,
        this.programInfo.attribLocations.instanceTexCoord2,
        this.programInfo.attribLocations.instanceTexCoord3,
      ];

      for (let i = 0; i < 4; i++) {
        const loc = texCoordAttribs[i];
        if (loc !== -1) {
          this.gl.enableVertexAttribArray(loc);
          this.gl.vertexAttribPointer(
            loc,
            2,
            this.gl.FLOAT,
            false,
            8 * 4, // 8 floats per instance (4 vertices * 2 coords)
            i * 2 * 4 // offset for each vertex
          );
          this.gl.vertexAttribDivisor(loc, 1); // This makes it instanced
        }
      }
    }

    // Set up instance matrix attributes (4 vec4s for each matrix)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceMatrixBuffer);

    const matrixLoc = this.programInfo.attribLocations.instanceMatrix;
    for (let i = 0; i < 4; i++) {
      const loc = matrixLoc + i;
      this.gl.enableVertexAttribArray(loc);
      this.gl.vertexAttribPointer(
        loc,
        4,
        this.gl.FLOAT,
        false,
        16 * 4,
        i * 4 * 4
      );
      this.gl.vertexAttribDivisor(loc, 1); // This makes it instanced
    }

    // Draw all instances
    const drawMode =
      this.vertices.length === 8 ? this.gl.TRIANGLE_STRIP : this.gl.TRIANGLES;
    this.gl.drawArraysInstanced(
      drawMode,
      0,
      this.vertices.length / 2,
      this.instances.length // Use actual instance count, not max
    );

    // Reset attribute divisors
    for (let i = 0; i < 4; i++) {
      this.gl.vertexAttribDivisor(matrixLoc + i, 0);
      this.gl.disableVertexAttribArray(matrixLoc + i);
    }

    // Reset texture coordinate attribute divisors
    if (this.useTexture) {
      const texCoordAttribs = [
        this.programInfo.attribLocations.instanceTexCoord0,
        this.programInfo.attribLocations.instanceTexCoord1,
        this.programInfo.attribLocations.instanceTexCoord2,
        this.programInfo.attribLocations.instanceTexCoord3,
      ];

      for (let i = 0; i < 4; i++) {
        const loc = texCoordAttribs[i];
        if (loc !== -1) {
          this.gl.vertexAttribDivisor(loc, 0);
          this.gl.disableVertexAttribArray(loc);
        }
      }
    }

    this.gl.uniform1i(this.programInfo.uniformLocations.useInstances, false);
  }

  /**
   * @method setInstanceFrame
   * @description Updates the frame of a specific instance
   * @param {string} instanceId - The ID of the instance to update
   * @param {number} frame - The frame to set
   */
  setInstanceFrame(instanceId, frame) {
    const instance = this.getInstanceWithId(instanceId);
    if (instance) {
      instance.frame = frame;
      const index = this.instances.indexOf(instance);
      if (index !== -1) {
        this.updateInstanceTexCoords(index);
      }
    }
  }

  /**
   * @method isPointInInstance
   * @description Checks if a point is inside a specific instance
   * @param {number} x - The x coordinate of the point
   * @param {number} y - The y coordinate of the point
   * @param {Instance} instance - The instance to check
   * @returns {boolean} - Whether the point is inside the instance
   */
  isPointInInstance(x, y, instance) {
    const left = instance.transform.position.x - instance.transform.scale.x;
    const right = instance.transform.position.x + instance.transform.scale.x;
    const top = instance.transform.position.y + instance.transform.scale.y;
    const bottom = instance.transform.position.y - instance.transform.scale.y;
    return x >= left && x <= right && y >= bottom && y <= top;
  }

  /**
   * @method getInstanceAtPosition
   * @description Gets an instance at a specific position
   * @param {Vector3} position - The position to check
   * @param {number} tolerance - The tolerance for the position
   * @returns {Instance} - The instance at the position
   */
  getInstanceAtPosition(position, tolerance = 0.1) {
    return this.instances.find((instance) => {
      const instancePosition = instance.transform.position;
      return (
        Math.abs(instancePosition.x - position.x) < tolerance &&
        Math.abs(instancePosition.y - position.y) < tolerance &&
        Math.abs(instancePosition.z - position.z) < tolerance
      );
    });
  }

  /**
   * @method getInstanceByFrame
   * @description Gets an instance by its frame index
   * @param {number} frameIndex - The frame index to get
   * @returns {Instance} - The instance at the frame index
   */
  getInstanceByFrame(frameIndex) {
    return this.instances.find((instance) => instance.frame === frameIndex);
  }

  /**
   * @method getInstanceAtPoint
   * @description Gets an instance at a specific point
   * @param {number} x - The x coordinate of the point
   * @param {number} y - The y coordinate of the point
   * @returns {Instance} - The instance at the point
   */
  getInstanceAtPoint(x, y) {
    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      if (this.isPointInInstance(x, y, instance)) {
        return instance;
      }
    }
    return null;
  }

  /**
   * @method addInstanceClickEvent
   * @description Adds a click event listener to a specific instance
   * @param {string} instanceId - The ID of the instance to add the click event listener to
   * @param {function} func - The function to call when the instance is clicked
   */
  addInstanceClickEvent(instanceId, func) {
    if (!this.instanceClickListeners.has(instanceId)) {
      this.instanceClickListeners.set(instanceId, new Set());
    }
    this.instanceClickListeners.get(instanceId).add(func);
  }

  /**
   * @method removeInstanceClickEvent
   * @description Removes a click event listener from a specific instance
   * @param {string} instanceId - The ID of the instance to remove the click event listener from
   * @param {function} func - The function to remove
   */
  removeInstanceClickEvent(instanceId, func) {
    if (this.instanceClickListeners.has(instanceId)) {
      this.instanceClickListeners.get(instanceId).delete(func);
      if (this.instanceClickListeners.get(instanceId).size === 0) {
        this.instanceClickListeners.delete(instanceId);
      }
    }
  }

  /**
   * @method addInstanceHoverEvent
   * @description Adds a hover event listener to a specific instance
   * @param {string} instanceId - The ID of the instance to add the hover event listener to
   * @param {function} enterFunc - The function to call when the instance is hovered
   * @param {function} leaveFunc - The function to call when the instance is no longer hovered
   */
  addInstanceHoverEvent(instanceId, enterFunc, leaveFunc) {
    if (!this.instanceHoverListeners.has(instanceId)) {
      this.instanceHoverListeners.set(instanceId, {
        enter: new Set(),
        leave: new Set(),
      });
    }
    this.instanceHoverListeners.get(instanceId).enter.add(enterFunc);
    this.instanceHoverListeners.get(instanceId).leave.add(leaveFunc);
  }

  /**
   * @method removeInstanceHoverEvent
   * @description Removes a hover event listener from a specific instance
   * @param {string} instanceId - The ID of the instance to remove the hover event listener from
   * @param {function} enterFunc - The function to remove
   * @param {function} leaveFunc - The function to remove
   */
  removeInstanceHoverEvent(instanceId, enterFunc, leaveFunc) {
    if (this.instanceHoverListeners.has(instanceId)) {
      const listeners = this.instanceHoverListeners.get(instanceId);
      listeners.enter.delete(enterFunc);
      listeners.leave.delete(leaveFunc);
      if (listeners.enter.size === 0 && listeners.leave.size === 0) {
        this.instanceHoverListeners.delete(instanceId);
      }
    }
  }

  /**
   * @method handleInstanceClick
   * @description Handles a click event for a specific instance
   * @param {Event} event - The event to handle
   * @param {number} x - The x coordinate of the click
   * @param {number} y - The y coordinate of the click
   */
  handleInstanceClick(event, x, y) {
    const clickedInstance = this.getInstanceAtPoint(x, y);
    if (clickedInstance) {
      const listeners = this.instanceClickListeners.get(clickedInstance.id);
      if (listeners) {
        listeners.forEach((func) => func(event, clickedInstance));
      }
      return true; // Event was handled
    }
    return false; // No instance was clicked
  }

  /**
   * @method handleInstanceHover
   * @description Handles a hover event for a specific instance
   * @param {Event} event - The event to handle
   * @param {number} x - The x coordinate of the hover
   * @param {number} y - The y coordinate of the hover
   * @param {Instance} lastHoveredInstance - The last hovered instance
   */
  handleInstanceHover(event, x, y, lastHoveredInstance) {
    const hoveredInstance = this.getInstanceAtPoint(x, y);

    if (hoveredInstance !== lastHoveredInstance) {
      // Handle leave event for previous instance
      if (lastHoveredInstance) {
        const leaveListeners = this.instanceHoverListeners.get(
          lastHoveredInstance.id
        );
        if (leaveListeners) {
          leaveListeners.leave.forEach((func) =>
            func(event, lastHoveredInstance)
          );
        }
      }

      // Handle enter event for new instance
      if (hoveredInstance) {
        const enterListeners = this.instanceHoverListeners.get(
          hoveredInstance.id
        );
        if (enterListeners) {
          enterListeners.enter.forEach((func) => func(event, hoveredInstance));
        }
      }
    }

    return hoveredInstance;
  }

  /**
   * @method playAnimation
   * @description Plays an animation
   * @param {Array} frames - The frames to play
   * @param {number} speed - The speed of the animation
   */
  playAnimation(frames, speed = 1000) {
    // Override with empty implementation
    console.warn("playAnimation is not implemented for InstancedTexture");
  }

  /**
   * @method playAnimationOnce
   * @description Plays an animation once
   * @param {Array} frames - The frames to play
   * @param {number} speed - The speed of the animation
   */
  playAnimationOnce(frames, speed = 1000) {
    // Override with empty implementation
    console.warn("playAnimationOnce is not implemented for InstancedTexture");
  }

  /**
   * @method getAnimation
   * @description Gets the animation
   * @returns {Array} - The animation
   */
  getAnimation() {
    // Override with empty implementation
    console.warn("getAnimation is not implemented for InstancedTexture");
  }
}

export default InstancedTexture;
