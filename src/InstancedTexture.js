import { initVertexBuffer, initInstancedBuffer } from "./GLUtils.js";
import Instance from "./Instance.js";
import Drawable from "./Drawable.js";
import { mat4 } from "gl-matrix";
import GLManager from "./managers/GLManager.js";
import GLState from "./managers/GLState.js";
import IDManager from "./managers/IDManager.js";
import RenderStats from "./managers/RenderStats.js";
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
    const textureCoordinates = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];
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
    this.instanceMatrices = new Float32Array(instanceCount * 16);
    this.instanceTexCoords = new Float32Array(instanceCount * 8);
    this.instanceColors = new Float32Array(instanceCount * 4).fill(1);

    this.instanceMatrixBuffer = initInstancedBuffer(
      GLManager.getGL(),
      this.instanceMatrices,
      16
    );

    this.instanceTexCoordBuffer = initInstancedBuffer(
      GLManager.getGL(),
      this.instanceTexCoords,
      8
    );

    this.instanceColorBuffer = initInstancedBuffer(
      GLManager.getGL(),
      this.instanceColors,
      4
    );

    this.instanceClickListeners = new Map();
    this.instanceHoverListeners = new Map();

    this.static = false;
    /** @private */
    this._matricesDirty = true;
  }

  /**
   * @method setStatic
   * @description Toggles static mode (see constructor notes).
   * @param {boolean} isStatic - Whether instances are non-moving
   */
  setStatic(isStatic) {
    this.static = isStatic;
    this._matricesDirty = true;
  }

  /**
   * @method markDirty
   * @description Forces an instance-matrix rebuild on the next draw.
   */
  markDirty() {
    this._matricesDirty = true;
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
      this._matricesDirty = true;
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
      const last = this.instances.length - 1;
      if (index !== last) {
        this.instances[index] = this.instances[last];
      }
      this.instances.pop();

      this.instanceClickListeners.delete(instanceID);
      this.instanceHoverListeners.delete(instanceID);
      IDManager.release(instanceID);

      this._matricesDirty = true;
    } else {
      console.warn("Instance not found:", instanceID);
    }
  }

  /**
   * @method clearInstances
   * @description Clears all instances from the instanced texture
   */
  clearInstances() {
    for (const inst of this.instances) IDManager.release(inst.id);
    this.instances = [];

    this.instanceClickListeners.clear();
    this.instanceHoverListeners.clear();

    this.instanceMatrices = new Float32Array(this.instanceCount * 16);
    this.instanceTexCoords = new Float32Array(this.instanceCount * 8);
    this.instanceColors = new Float32Array(this.instanceCount * 4).fill(1);

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

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceColorBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.instanceColors,
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
    this.instanceColors = new Float32Array(newCount * 4).fill(1);
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
    this.instanceColorBuffer = initInstancedBuffer(
      this.gl,
      this.instanceColors,
      4
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
        this.pixelart
          ? Math.round(this.instances[index].transform.position.x)
          : this.instances[index].transform.position.x,
        this.pixelart
          ? Math.round(this.instances[index].transform.position.y)
          : this.instances[index].transform.position.y,
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

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceMatrixBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.instanceMatrices,
      this.gl.DYNAMIC_DRAW
    );

    this.updateAllInstanceTexCoords();
    this.updateAllInstanceColors();
  }

  /**
   * @method updateInstanceColor
   * @description Writes a single instance's RGBA tint into the color array.
   * Reads `instance._tint` ([r,g,b,a] in 0..1) when set, else opaque white.
   * @param {number} index - The instance index
   */
  updateInstanceColor(index) {
    if (index < 0 || index >= this.instances.length) return;
    const tint = this.instances[index]._tint;
    const offset = index * 4;
    if (tint) {
      this.instanceColors[offset] = tint[0];
      this.instanceColors[offset + 1] = tint[1];
      this.instanceColors[offset + 2] = tint[2];
      this.instanceColors[offset + 3] = tint[3];
    } else {
      this.instanceColors[offset] = 1;
      this.instanceColors[offset + 1] = 1;
      this.instanceColors[offset + 2] = 1;
      this.instanceColors[offset + 3] = 1;
    }
  }

  /**
   * @method updateAllInstanceColors
   * @description Rebuilds and uploads the per-instance color buffer.
   */
  updateAllInstanceColors() {
    for (let i = 0; i < this.instances.length; i++) {
      this.updateInstanceColor(i);
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceColorBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.instanceColors,
      this.gl.DYNAMIC_DRAW
    );
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
      const instance = this.instances[index];
      const texCoords =
        instance._regionUV || this.getFrameTexCoords(instance.frame);

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

    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      if (instance.updateAnimation(currentTime)) {
        needsUpdate = true;
      }
    }

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
      const col = frame % this.framesPerRow;
      const row = Math.floor(frame / this.framesPerRow);

      const ix = 0.5 / this.textureWidth;
      const iy = 0.5 / this.textureHeight;

      texLeft = ((col + 1) * this.frameWidth) / this.textureWidth - ix;
      texRight = (col * this.frameWidth) / this.textureWidth + ix;
      texTop =
        (this.textureHeight - row * this.frameHeight - this.frameHeight) /
          this.textureHeight +
        iy;
      texBottom =
        (this.textureHeight - row * this.frameHeight) / this.textureHeight - iy;
    } else {
      texLeft = 1.0;
      texRight = 0.0;
      texTop = 0.0;
      texBottom = 1.0;
    }

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
   * @method _restoreGL
   * @description Rebuilds the per-instance buffers from their CPU-side arrays
   * after a WebGL context loss, on top of the base Drawable restore.
   * @private
   */
  _restoreGL() {
    if (this._disposed) return;
    super._restoreGL();
    const gl = this.gl;
    if (!gl) return;
    this.instanceMatrixBuffer = initInstancedBuffer(
      gl,
      this.instanceMatrices,
      16
    );
    this.instanceTexCoordBuffer = initInstancedBuffer(
      gl,
      this.instanceTexCoords,
      8
    );
    this.instanceColorBuffer = initInstancedBuffer(gl, this.instanceColors, 4);
    this._matricesDirty = true;
  }

  /**
   * @method dispose
   * @description Frees the per-instance GPU buffers on top of the base
   * Drawable disposal. Safe to call twice.
   */
  dispose() {
    if (this._disposed) return;
    const gl = this.gl;
    if (gl) {
      if (this.instanceMatrixBuffer) gl.deleteBuffer(this.instanceMatrixBuffer);
      if (this.instanceTexCoordBuffer)
        gl.deleteBuffer(this.instanceTexCoordBuffer);
      if (this.instanceColorBuffer) gl.deleteBuffer(this.instanceColorBuffer);
    }
    this.instanceMatrixBuffer = null;
    this.instanceTexCoordBuffer = null;
    this.instanceColorBuffer = null;
    this.instances = [];
    super.dispose();
  }

  /**
   * @method syncPhysics
   * @description Copies simulation state (position + rotation) from each
   * instance's dynamic rigidbody onto the instance transform. Driven once per
   * frame by the owning GameObject's syncPhysics(), so draw() stays read-only.
   */
  syncPhysics() {
    for (let i = 0; i < this.instances.length; i++) {
      const instance = this.instances[i];
      const rigidBody = instance.getComponent(RigidBody);
      if (!rigidBody || rigidBody.getType() !== "dynamic") continue;
      rigidBody.syncTransform(instance.transform);
      const collider =
        rigidBody.getCollider() || instance.getComponent(Collider);
      if (collider && typeof collider.syncDebugShape === "function") {
        collider.syncDebugShape(instance.transform);
      }
      this._matricesDirty = true;
    }
  }

  /**
   * @method draw
   * @description Draws the instanced texture
   */
  draw() {
    if (!this.instances || this.instances.length === 0) return;

    if (!this.static || this._matricesDirty) {
      this.updateAllInstanceMatrices();
      this._matricesDirty = false;
    }
    this.update(performance.now());
    GLState.uniform1i(
      this.gl,
      this.programInfo.uniformLocations.useTexture,
      this.useTexture
    );

    GLState.uniform1i(
      this.gl,
      this.programInfo.uniformLocations.useInstances,
      true
    );

    GLState.uniform1i(
      this.gl,
      this.programInfo.uniformLocations.useLighting,
      this.useLighting
    );

    GLState.uniform4fv(
      this.gl,
      this.programInfo.uniformLocations.color,
      this.color
    );

    const ownerGameObject = this.getParent();
    const ownerOpacity =
      ownerGameObject && typeof ownerGameObject.opacity === "number"
        ? ownerGameObject.opacity
        : 1.0;
    GLState.uniform1f(
      this.gl,
      this.programInfo.uniformLocations.uOpacity,
      ownerOpacity
    );

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
        RenderStats.textureBinds++;
      }

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceTexCoordBuffer);

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
            8 * 4,
            i * 2 * 4
          );
          this.gl.vertexAttribDivisor(loc, 1);
        }
      }
    }

    const colorLoc = this.programInfo.attribLocations.instanceColor;
    if (colorLoc !== undefined && colorLoc !== -1) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceColorBuffer);
      this.gl.enableVertexAttribArray(colorLoc);
      this.gl.vertexAttribPointer(colorLoc, 4, this.gl.FLOAT, false, 0, 0);
      this.gl.vertexAttribDivisor(colorLoc, 1);
    }

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
      this.gl.vertexAttribDivisor(loc, 1);
    }

    const drawMode =
      this.vertices.length === 8 ? this.gl.TRIANGLE_STRIP : this.gl.TRIANGLES;
    this._applyBlend();
    this.gl.drawArraysInstanced(
      drawMode,
      0,
      this.vertices.length / 2,
      this.instances.length
    );
    this._restoreBlend();
    RenderStats.drawCalls++;
    RenderStats.quads += this.instances.length;

    for (let i = 0; i < 4; i++) {
      this.gl.vertexAttribDivisor(matrixLoc + i, 0);
      this.gl.disableVertexAttribArray(matrixLoc + i);
    }

    if (colorLoc !== undefined && colorLoc !== -1) {
      this.gl.vertexAttribDivisor(colorLoc, 0);
      this.gl.disableVertexAttribArray(colorLoc);
    }

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

    GLState.uniform1i(
      this.gl,
      this.programInfo.uniformLocations.useInstances,
      false
    );
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
      return true;
    }
    return false;
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
    console.warn("playAnimation is not implemented for InstancedTexture");
  }

  /**
   * @method playAnimationOnce
   * @description Plays an animation once
   * @param {Array} frames - The frames to play
   * @param {number} speed - The speed of the animation
   */
  playAnimationOnce(frames, speed = 1000) {
    console.warn("playAnimationOnce is not implemented for InstancedTexture");
  }

  /**
   * @method getAnimation
   * @description Gets the animation
   * @returns {Array} - The animation
   */
  getAnimation() {
    console.warn("getAnimation is not implemented for InstancedTexture");
  }
}

export default InstancedTexture;
