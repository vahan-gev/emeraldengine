import Color from "./Color.js";
import { mat4, vec3, vec4 } from "gl-matrix";
import IDManager from "./managers/IDManager.js";

/**
 * @class Drawable
 * @description A class that represents a drawable object
 * @param {WebGLRenderingContext} gl - The WebGL rendering context
 * @param {Object} programInfo - The program information
 * @param {WebGLBuffer} verticesBuffer - The vertices buffer
 * @param {WebGLBuffer} texCoordBuffer - The texture coordinate buffer
 * @param {Array} vertices - The vertices of the object
 * @param {boolean} useTexture - Whether to use a texture
 * @param {string} texturePath - The path to the texture
 * @param {number} frameWidth - The width of the frame
 * @param {number} frameHeight - The height of the frame
 * @param {number} framesPerRow - The number of frames per row
 * @param {number} totalFrames - The total number of frames
 * @param {number} animationSpeed - The speed of the animation
 * @param {boolean} autoplay - Whether to autoplay the animation
 * @param {boolean} pixelart - Whether to use pixel art
 * @param {boolean} useLighting - Whether to use lighting
 */
class Drawable {
  constructor(
    gl,
    programInfo,
    verticesBuffer,
    texCoordBuffer,
    vertices,
    useTexture,
    texturePath,
    frameWidth = 0,
    frameHeight = 0,
    framesPerRow = 1,
    totalFrames = 1,
    animationSpeed = 1000,
    autoplay = true,
    pixelart = false,
    useLighting = true
  ) {
    this.gl = gl;
    this.programInfo = programInfo;
    this.id = IDManager.generateUniqueID();
    this.verticesBuffer = verticesBuffer;
    this.texCoordBuffer = texCoordBuffer;
    this.vertices = vertices;
    this.color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    this.texturePath = texturePath;
    this.texture = null;
    this.useTexture = useTexture;
    if (useTexture) {
      this.initTexture().then(() => { });
    }
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.framesPerRow = framesPerRow;
    this.totalFrames = totalFrames;
    this.currentFrame = 0;
    this.animationSpeed = animationSpeed;
    this.lastFrameTime = 0;
    this.textureWidth = 0;
    this.textureHeight = 0;
    this.isPlaying = autoplay;
    this.playOnce = false;
    this.originalTexture = null;
    this.mirrored = false;
    this.animationType = "texturePath";
    this.currentAnimationArray = [];
    this.currentAnimationIndex = 0;
    this.shouldRevertAfterPlayingOnce = false;
    this.revertAnimation = [];
    this.parentObject = null;
    this.isActive = false;
    this.isWireframe = false;
    this.callbackFunction = () => { };
    this.pixelart = pixelart;
    this.useLighting = useLighting; // Default to true to maintain existing behavior
  }

  /**
   * @method setIsWireframe
   * @description Sets the wireframe mode
   * @param {boolean} bool - Whether to enable wireframe mode
   */
  setIsWireframe(bool) {
    this.isWireframe = bool;
  }

  /**
   * @method setUseLighting
   * @description Sets the lighting mode
   * @param {boolean} useLighting - Whether to enable lighting reaction
   */
  setUseLighting(useLighting) {
    this.useLighting = useLighting;
  }

  /**
   * @method setIsActive
   * @description Sets the active state
   * @param {boolean} bool - Whether to enable the active state
   */
  setIsActive(bool) {
    this.isActive = bool;
  }

  /**
   * @method setParent
   * @description Sets the parent object
   * @param {Object} parent - The parent object
   */
  setParent(parent) {
    this.parentObject = parent;
  }

  /**
   * @method getParent
   * @description Gets the parent object
   * @returns {Object} - The parent object
   */
  getParent() {
    return this.parentObject;
  }

  /**
   * @method setColor
   * @description Sets the color of the object
   * @param {Color} color - The color to set
   */
  setColor(color) {
    if (color instanceof Color) {
      vec4.set(
        this.color,
        color.r / 255,
        color.g / 255,
        color.b / 255,
        color.a / 255
      );
    } else {
      console.error("[Drawable.js] > color is not an instance of Color class.");
    }
  }

  /**
   * @method initTexture
   * @description Initializes the texture
   */
  async initTexture() {
    const image = await this.loadImage(this.texturePath);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.pixelart ? this.gl.NEAREST : this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.pixelart ? this.gl.NEAREST : this.gl.LINEAR
    );
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image
    );
    this.textureWidth = image.width;
    this.textureHeight = image.height;
    this.originalTexture = this.texture;
  }

  /**
   * @method updateAnimation
   * @description Updates the animation
   * @param {number} currentTime - The current time
   */
  updateAnimation(currentTime) {
    if (
      this.totalFrames > 1 &&
      this.isPlaying &&
      currentTime - this.lastFrameTime > this.animationSpeed
    ) {
      if (this.animationType === "texturePath") {
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      } else if (this.animationType === "array") {
        this.currentFrame =
          this.currentAnimationArray[this.currentAnimationIndex];
        this.currentAnimationIndex++;
        if (this.currentAnimationIndex >= this.currentAnimationArray.length) {
          if (this.playOnce) {
            if (this.shouldRevertAfterPlayingOnce) {
              this.currentAnimationIndex = 0;
              this.currentAnimationArray = this.revertAnimation;
            } else {
              this.isPlaying = false;
            }
            this.playOnce = false;
            this.callbackFunction();
          } else {
            this.currentAnimationIndex = 0;
          }
        }
      }
      this.lastFrameTime = currentTime;
    }
  }

  /**
   * @method getAnimation
   * @description Gets the animation
   * @returns {Array} - The animation
   */
  getAnimation() {
    if (this.animationType === "texturePath") {
      return this.texturePath;
    } else if (this.animationType === "array") {
      return this.currentAnimationArray;
    }
    return null;
  }

  /**
   * @method playAnimation
   * @description Plays an animation
   * @param {Array} animation - The animation to play
   * @param {number} animationSpeed - The speed of the animation
   */
  playAnimation(animation, animationSpeed = 1000) {
    if (animation.length !== 0) {
      this.animationSpeed = animationSpeed;
      this.animationType = "array";
      this.currentAnimationArray = animation;
      this.currentAnimationIndex = 0;
      // Not tested
      // this.currentFrame = 0;
      this.isPlaying = true;
      this.playOnce = false;
    } else {
      console.error(
        "[Drawable.js] | [playAnimation] > Animation cannot be empty!"
      );
    }
  }

  /**
   * @method setFrame
   * @description Sets the frame
   * @param {number} frame - The frame to set
   */
  setFrame(frame) {
    this.currentFrame = frame;
    this.isPlaying = false;
  }

  /**
   * @method playAnimationOnce
   * @description Plays an animation once
   * @param {Array} animation - The animation to play
   * @param {Array} defaultAnimation - The default animation
   * @param {number} animationSpeed - The speed of the animation
   * @param {function} callbackFunction - The callback function
   */
  playAnimationOnce(
    animation,
    defaultAnimation = null,
    animationSpeed = 1000,
    callbackFunction = null
  ) {
    if (animation.length !== 0) {
      this.animationSpeed = animationSpeed;
      this.animationType = "array";
      this.currentAnimationArray = animation;
      this.currentAnimationIndex = 0;
      // Not tested
      // this.currentFrame = 0;
      this.isPlaying = true;
      this.playOnce = true;
      if (defaultAnimation !== null && defaultAnimation.length > 0) {
        this.shouldRevertAfterPlayingOnce = true;
        this.revertAnimation = defaultAnimation;
      } else {
        this.shouldRevertAfterPlayingOnce = false;
        this.revertAnimation = [];
      }

      if (callbackFunction) {
        this.callbackFunction = callbackFunction;
      }
    } else {
      console.error(
        "[Drawable.js] | [playAnimationOnce] > Animation cannot be empty!"
      );
    }
  }

  /**
   * @method stopAnimation
   * @description Stops the animation
   */
  stopAnimation() {
    this.currentFrame = 0;
    this.isPlaying = false;
    this.playOnce = false;
    this.texture = this.originalTexture;
  }

  /**
   * @method draw
   * @description Draws the object
   * @param {mat4} globalViewMatrix - The global view matrix
   * @param {WebGLUniformLocation} uniformLocation - The uniform location
   * @param {number} currentTime - The current time
   * @param {Object} objectTransform - The object transform
   */
  draw(globalViewMatrix, uniformLocation, currentTime, objectTransform) {
    let objectTransformMatrix = mat4.create();
    mat4.translate(
      objectTransformMatrix,
      objectTransformMatrix,
      vec3.fromValues(
        objectTransform.position.x,
        objectTransform.position.y,
        objectTransform.position.z
      )
    );
    mat4.rotate(objectTransformMatrix, objectTransformMatrix, 0, [1, 0, 0]);
    mat4.rotate(objectTransformMatrix, objectTransformMatrix, 0, [0, 1, 0]);
    mat4.rotate(
      objectTransformMatrix,
      objectTransformMatrix,
      objectTransform.rotation,
      [0, 0, 1]
    );

    // The scale values here represent half-extents
    mat4.scale(
      objectTransformMatrix,
      objectTransformMatrix,
      vec3.fromValues(objectTransform.scale.x, objectTransform.scale.y, 1.0)
    );

    let finalTransformMatrix = mat4.create();
    mat4.mul(finalTransformMatrix, globalViewMatrix, objectTransformMatrix);
    this.gl.uniform1i(
      this.programInfo.uniformLocations.useTexture,
      this.useTexture
    );
    this.gl.uniform1i(this.programInfo.uniformLocations.useInstances, false);

    // Set lighting uniform
    this.gl.uniform1i(
      this.programInfo.uniformLocations.useLighting,
      this.useLighting
    );

    // Always set the color uniform for tinting
    this.gl.uniform4fv(this.programInfo.uniformLocations.color, this.color);

    // Set per-GameObject opacity if available (defaults to 1.0)
    const parentOpacity = this.parentObject && typeof this.parentObject.opacity === "number"
      ? this.parentObject.opacity
      : 1.0;
    if (this.programInfo.uniformLocations.uOpacity) {
      this.gl.uniform1f(this.programInfo.uniformLocations.uOpacity, parentOpacity);
    }

    this.gl.uniformMatrix4fv(
      uniformLocation,
      false,
      new Float32Array(finalTransformMatrix)
    );

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

    // Bind and set texture coordinate buffer
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

      this.updateAnimation(currentTime);

      let texLeft, texRight, texTop, texBottom;

      if (this.frameWidth > 0 && this.frameHeight > 0) {
        // Spritesheet animation
        const col = this.currentFrame % this.framesPerRow;
        const row = Math.floor(this.currentFrame / this.framesPerRow);

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
      // If mirrored change texLeft and texRight in places
      const texCoords = this.mirrored
        ? new Float32Array([
          texRight,
          texBottom,
          texLeft,
          texBottom,
          texRight,
          texTop,
          texLeft,
          texTop,
        ])
        : new Float32Array([
          texLeft,
          texBottom,
          texRight,
          texBottom,
          texLeft,
          texTop,
          texRight,
          texTop,
        ]);
      // Update texture coordinate buffer
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
    } else {
      // If not using texture, disable the texture attribute
      this.gl.disableVertexAttribArray(
        this.programInfo.attribLocations.aTexCoord
      );
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    let drawMode, vertexCount;

    if (this.vertices.length === 8) {
      // Square/Rectangle - Triangle strip
      drawMode = this.gl.TRIANGLE_STRIP;
      vertexCount = 4;
    } else if (this.vertices.length === 6) {
      // Triangle
      drawMode = this.gl.TRIANGLES;
      vertexCount = 3;
    } else {
      // Circle - Triangle fan
      drawMode = this.gl.TRIANGLE_FAN;
      vertexCount = this.vertices.length / 2;
    }

    if (this.isWireframe) {
      // Fix the wireframe for square
      if (this.vertices.length === 8) {
        let tempBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tempBuffer);

        const rectOutline = new Float32Array([
          this.vertices[0],
          this.vertices[1], // Bottom-left (0)
          this.vertices[2],
          this.vertices[3], // Bottom-right (1)
          this.vertices[6],
          this.vertices[7], // Top-right (2)
          this.vertices[4],
          this.vertices[5], // Top-left (3)
        ]);

        this.gl.bufferData(
          this.gl.ARRAY_BUFFER,
          rectOutline,
          this.gl.STATIC_DRAW
        );

        this.gl.vertexAttribPointer(
          this.programInfo.attribLocations.vertexPosition,
          2,
          this.gl.FLOAT,
          false,
          0,
          0
        );

      }
      drawMode = this.gl.LINE_LOOP;
    }

    this.gl.drawArrays(drawMode, 0, vertexCount);
  }

  /**
   * @method loadImage
   * @description Loads an image
   * @param {string} path - The path to the image
   * @returns {Promise} - The promise
   */
  loadImage = (path) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (err) => reject(err));
      image.src = path;
    });
}

export default Drawable;
