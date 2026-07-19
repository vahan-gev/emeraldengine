import Color from "./Color.js";
import { mat4, vec3, vec4 } from "gl-matrix";
import IDManager from "./managers/IDManager.js";
import TextureManager from "./managers/TextureManager.js";
import GLState from "./managers/GLState.js";
import GLManager from "./managers/GLManager.js";
import RenderStats from "./managers/RenderStats.js";
import { initVertexBuffer } from "./GLUtils.js";

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
        useLighting = true,
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
        this.pixelart = pixelart;
        /** @private */
        this._disposed = false;
        /** @private */
        this._texRetained = false;
        if (useTexture) {
            this.initTexture().catch((err) => {
                console.error(
                    `[Drawable.js] > Could not initialize texture "${this.texturePath}".`,
                    err && err.message ? err.message : err
                );
            });
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
        this.flippedY = false;

        /** @private */
        this._pivotX = 0;
        /** @private */
        this._pivotY = 0;
        /** @private */
        this._hasPivot = false;
        this.animationType = "texturePath";
        this.currentAnimationArray = [];
        this.currentAnimationIndex = 0;
        this.shouldRevertAfterPlayingOnce = false;
        this.revertAnimation = [];
        this.parentObject = null;
        this.isActive = false;
        this.isWireframe = false;
        this.callbackFunction = () => {};
        this.useLighting = useLighting;

        /** @private */
        this._objectTransformMatrix = mat4.create();
        /** @private */
        this._finalTransformMatrix = mat4.create();

        /** @private */
        this._lastTexFrame = -1;
        /** @private */
        this._lastMirrored = undefined;
        /** @private */
        this._lastFlippedY = undefined;
        /** @private */
        this._lastTextureWidth = -1;

        /** @private */
        this._wireframeBuffer = null;

        this.blendMode = "normal";

        /** @private */
        this._region = null;
        /** @private */
        this._lastRegion = undefined;

        this.material = null;

        GLManager.registerRestorable(this);
    }

    /**
     * @method _restoreGL
     * @description Rebuilds this drawable's GPU resources after a WebGL
     * context loss: vertex/texcoord buffers from their kept CPU copies, and a
     * fresh texture pointer from the (re-uploaded) TextureManager cache.
     * Called by GLManager.restoreAll(); not meant for manual use.
     * @private
     */
    _restoreGL() {
        if (this._disposed) return;
        const gl = this.gl;
        if (!gl) return;
        if (this.verticesBuffer && this.verticesBuffer._src) {
            this.verticesBuffer = initVertexBuffer(gl, this.verticesBuffer._src);
        }
        if (this.texCoordBuffer && this.texCoordBuffer._src) {
            this.texCoordBuffer = initVertexBuffer(gl, this.texCoordBuffer._src);
        }
        this._wireframeBuffer = null;
        this._lastTexFrame = -1;
        this._lastMirrored = undefined;
        this._lastFlippedY = undefined;
        this._lastTextureWidth = -1;
        this._lastRegion = undefined;
        if (this.useTexture && typeof this.texturePath === "string" && this.texturePath) {
            TextureManager.getTexture(this.texturePath, this.pixelart)
                .then(({ texture, width, height }) => {
                    if (this._disposed) return;
                    this.texture = texture;
                    this.originalTexture = texture;
                    this.textureWidth = width;
                    this.textureHeight = height;
                })
                .catch(() => {});
        }
    }

    /**
     * @method setMaterial
     * @description Assigns a custom Material (fragment shader) to this drawable,
     * or pass null to revert to the standard shader.
     * @param {Material|null} material
     */
    setMaterial(material) {
        this.material = material;
    }

    /**
     * @method setBlendMode
     * @description Sets the blend mode ("normal", "additive", "multiply").
     * @param {string} mode - The blend mode
     */
    setBlendMode(mode) {
        this.blendMode = mode;
    }

    /**
     * @method setRegion
     * @description Sets a normalized UV sub-rect (for atlas frames). Values are
     * 0..1 with top-left origin. Pass nothing to clear.
     */
    setRegion(left, top, right, bottom) {
        this._region =
            left === undefined ? null : { left, top, right, bottom };
    }

    /**
     * @method setFlipX
     * @description Horizontally mirrors the sprite (e.g. to face left/right)
     * without touching the GameObject's scale.
     * @param {boolean} flip
     */
    setFlipX(flip) {
        this.mirrored = !!flip;
    }

    /**
     * @method setFlipY
     * @description Vertically mirrors the sprite.
     * @param {boolean} flip
     */
    setFlipY(flip) {
        this.flippedY = !!flip;
    }

    /**
     * @method getFlipX
     * @returns {boolean}
     */
    getFlipX() {
        return this.mirrored;
    }

    /**
     * @method getFlipY
     * @returns {boolean}
     */
    getFlipY() {
        return this.flippedY;
    }

    /**
     * @method setPivot
     * @description Sets the sprite's origin in normalized local space, where
     * (0,0) is the center (default), x runs -1 (left) .. 1 (right) and y runs
     * -1 (bottom) .. 1 (top). The chosen point is what sits on the GameObject's
     * position and acts as the rotation/scale center. Call with no args to reset
     * to centered.
     * @param {number} [x=0]
     * @param {number} [y=0]
     */
    setPivot(x = 0, y = 0) {
        this._pivotX = x;
        this._pivotY = y;
        this._hasPivot = x !== 0 || y !== 0;
    }

    /**
     * @method setAnchor
     * @description Convenience wrapper around setPivot using 0..1 anchor
     * coordinates with a top-left origin (CSS-style): (0.5,0.5) = center,
     * (0.5,1) = bottom-center, (0,0) = top-left.
     * @param {number} [ax=0.5]
     * @param {number} [ay=0.5]
     */
    setAnchor(ax = 0.5, ay = 0.5) {
        this.setPivot(ax * 2 - 1, 1 - ay * 2);
    }

    /** @private */
    _applyBlend() {
        if (this.blendMode === "additive") {
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        } else if (this.blendMode === "multiply") {
            this.gl.blendFunc(this.gl.DST_COLOR, this.gl.ONE_MINUS_SRC_ALPHA);
        }
    }

    /** @private */
    _restoreBlend() {
        if (this.blendMode !== "normal") {
            this.gl.blendFuncSeparate(
                this.gl.SRC_ALPHA,
                this.gl.ONE_MINUS_SRC_ALPHA,
                this.gl.ONE,
                this.gl.ONE_MINUS_SRC_ALPHA,
            );
        }
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
                color.a / 255,
            );
        } else {
            console.error(
                "[Drawable.js] > color is not an instance of Color class.",
            );
        }
    }

    /**
     * @method initTexture
     * @description Initializes the texture
     */
    async initTexture() {
        const { texture, width, height } = await TextureManager.getTexture(
            this.texturePath,
            this.pixelart,
        );
        if (this._disposed) {
            return;
        }
        TextureManager.retain(this.texturePath, this.pixelart);
        this._texRetained = true;
        this.texture = texture;
        this.textureWidth = width;
        this.textureHeight = height;
        this.originalTexture = texture;
    }

    /**
     * @method dispose
     * @description Frees this drawable's GPU resources: its vertex/texcoord
     * buffers and its reference on the shared texture (the GL texture itself is
     * deleted when the last drawable using it is disposed). Call it when the
     * owning object is permanently removed — GameObject.destroy() and
     * Scene.remove(obj, { dispose: true }) do it for you. Safe to call twice.
     */
    dispose() {
        if (this._disposed) return;
        this._disposed = true;
        GLManager.unregisterRestorable(this);
        const gl = this.gl;
        if (gl) {
            if (this.verticesBuffer) gl.deleteBuffer(this.verticesBuffer);
            if (this.texCoordBuffer) gl.deleteBuffer(this.texCoordBuffer);
            if (this._wireframeBuffer) gl.deleteBuffer(this._wireframeBuffer);
        }
        this.verticesBuffer = null;
        this.texCoordBuffer = null;
        this._wireframeBuffer = null;
        if (this._texRetained) {
            TextureManager.release(this.texturePath, this.pixelart);
            this._texRetained = false;
        }
        this.texture = null;
        this.originalTexture = null;
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
                if (
                    this.currentAnimationIndex >=
                    this.currentAnimationArray.length
                ) {
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
            this.isPlaying = true;
            this.playOnce = false;
        } else {
            console.error(
                "[Drawable.js] | [playAnimation] > Animation cannot be empty!",
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
        callbackFunction = null,
    ) {
        if (animation.length !== 0) {
            this.animationSpeed = animationSpeed;
            this.animationType = "array";
            this.currentAnimationArray = animation;
            this.currentAnimationIndex = 0;
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
                "[Drawable.js] | [playAnimationOnce] > Animation cannot be empty!",
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
        let objectTransformMatrix = this._objectTransformMatrix;
        mat4.identity(objectTransformMatrix);
        mat4.translate(
            objectTransformMatrix,
            objectTransformMatrix,
            vec3.fromValues(
                this.pixelart
                    ? Math.round(objectTransform.position.x)
                    : objectTransform.position.x,
                this.pixelart
                    ? Math.round(objectTransform.position.y)
                    : objectTransform.position.y,
                objectTransform.position.z,
            ),
        );
        mat4.rotate(objectTransformMatrix, objectTransformMatrix, 0, [1, 0, 0]);
        mat4.rotate(objectTransformMatrix, objectTransformMatrix, 0, [0, 1, 0]);
        mat4.rotate(
            objectTransformMatrix,
            objectTransformMatrix,
            objectTransform.rotation,
            [0, 0, 1],
        );

        mat4.scale(
            objectTransformMatrix,
            objectTransformMatrix,
            vec3.fromValues(
                objectTransform.scale.x,
                objectTransform.scale.y,
                1.0,
            ),
        );

        if (this._hasPivot) {
            mat4.translate(
                objectTransformMatrix,
                objectTransformMatrix,
                vec3.fromValues(-this._pivotX, -this._pivotY, 0),
            );
        }

        let finalTransformMatrix = this._finalTransformMatrix;
        mat4.mul(finalTransformMatrix, globalViewMatrix, objectTransformMatrix);

        const usingMaterial = !!this.material;
        const programInfo = usingMaterial
            ? this.material.programInfo
            : this.programInfo;

        const parentOpacity =
            this.parentObject && typeof this.parentObject.opacity === "number"
                ? this.parentObject.opacity
                : 1.0;

        if (usingMaterial) {
            this.gl.useProgram(this.material.program);
            const ml = programInfo.uniformLocations;
            this.gl.uniformMatrix4fv(
                ml.projectionMatrix,
                false,
                GLManager.getProjection(),
            );
            this.gl.uniformMatrix4fv(ml.globalViewMatrix, false, finalTransformMatrix);
            if (ml.useInstances != null) this.gl.uniform1i(ml.useInstances, 0);
            if (ml.color != null) this.gl.uniform4fv(ml.color, this.color);
            if (ml.uOpacity != null) this.gl.uniform1f(ml.uOpacity, parentOpacity);
            if (ml.uTime != null) this.gl.uniform1f(ml.uTime, currentTime / 1000);
            this.material.applyCustomUniforms(this);
        } else {
            GLState.uniform1i(
                this.gl,
                this.programInfo.uniformLocations.useTexture,
                this.useTexture,
            );
            GLState.uniform1i(
                this.gl,
                this.programInfo.uniformLocations.useInstances,
                false,
            );

            GLState.uniform1i(
                this.gl,
                this.programInfo.uniformLocations.useLighting,
                this.useLighting,
            );

            GLState.uniform4fv(
                this.gl,
                this.programInfo.uniformLocations.color,
                this.color,
            );

            GLState.uniform1f(
                this.gl,
                this.programInfo.uniformLocations.uOpacity,
                parentOpacity,
            );

            this.gl.uniformMatrix4fv(uniformLocation, false, finalTransformMatrix);
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.verticesBuffer);
        this.gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            2,
            this.gl.FLOAT,
            false,
            0,
            0,
        );
        this.gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition,
        );

        if (this.useTexture) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
            this.gl.vertexAttribPointer(
                programInfo.attribLocations.aTexCoord,
                2,
                this.gl.FLOAT,
                false,
                0,
                0,
            );
            this.gl.enableVertexAttribArray(
                programInfo.attribLocations.aTexCoord,
            );

            if (this.texture) {
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
                RenderStats.textureBinds++;
            }

            this.updateAnimation(currentTime);

            const texNeedsUpdate =
                this.currentFrame !== this._lastTexFrame ||
                this.mirrored !== this._lastMirrored ||
                this.flippedY !== this._lastFlippedY ||
                this.textureWidth !== this._lastTextureWidth ||
                this._region !== this._lastRegion;

            if (texNeedsUpdate) {
                let texLeft, texRight, texTop, texBottom;

                if (this._region) {
                    texLeft = this._region.right;
                    texRight = this._region.left;
                    texTop = this._region.top;
                    texBottom = this._region.bottom;
                } else if (this.frameWidth > 0 && this.frameHeight > 0) {
                    const col = this.currentFrame % this.framesPerRow;
                    const row = Math.floor(
                        this.currentFrame / this.framesPerRow,
                    );

                    const ix = 0.5 / this.textureWidth;
                    const iy = 0.5 / this.textureHeight;

                    texLeft =
                        ((col + 1) * this.frameWidth) / this.textureWidth - ix;
                    texRight =
                        (col * this.frameWidth) / this.textureWidth + ix;
                    texTop =
                        (this.textureHeight -
                            row * this.frameHeight -
                            this.frameHeight) /
                            this.textureHeight +
                        iy;
                    texBottom =
                        (this.textureHeight - row * this.frameHeight) /
                            this.textureHeight -
                        iy;
                } else {
                    texLeft = 1.0;
                    texRight = 0.0;
                    texTop = 0.0;
                    texBottom = 1.0;
                }
                let l = texLeft;
                let r = texRight;
                let tp = texTop;
                let bt = texBottom;
                if (this.mirrored) {
                    const tmp = l;
                    l = r;
                    r = tmp;
                }
                if (this.flippedY) {
                    const tmp = tp;
                    tp = bt;
                    bt = tmp;
                }
                const texCoords = new Float32Array([
                    l, bt,
                    r, bt,
                    l, tp,
                    r, tp,
                ]);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
                this.gl.bufferData(
                    this.gl.ARRAY_BUFFER,
                    texCoords,
                    this.gl.STATIC_DRAW,
                );

                this._lastTexFrame = this.currentFrame;
                this._lastMirrored = this.mirrored;
                this._lastFlippedY = this.flippedY;
                this._lastTextureWidth = this.textureWidth;
                this._lastRegion = this._region;
            }
        } else {
            if (
                usingMaterial &&
                programInfo.attribLocations.aTexCoord != null &&
                programInfo.attribLocations.aTexCoord >= 0
            ) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
                this.gl.vertexAttribPointer(
                    programInfo.attribLocations.aTexCoord,
                    2,
                    this.gl.FLOAT,
                    false,
                    0,
                    0,
                );
                this.gl.enableVertexAttribArray(
                    programInfo.attribLocations.aTexCoord,
                );
            } else {
                this.gl.disableVertexAttribArray(
                    programInfo.attribLocations.aTexCoord,
                );
            }
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }

        let drawMode, vertexCount;

        if (this.vertices.length === 8) {
            drawMode = this.gl.TRIANGLE_STRIP;
            vertexCount = 4;
        } else if (this.vertices.length === 6) {
            drawMode = this.gl.TRIANGLES;
            vertexCount = 3;
        } else {
            drawMode = this.gl.TRIANGLE_FAN;
            vertexCount = this.vertices.length / 2;
        }

        if (this.isWireframe) {
            if (this.vertices.length === 8) {
                if (this._wireframeBuffer === null) {
                    this._wireframeBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(
                        this.gl.ARRAY_BUFFER,
                        this._wireframeBuffer,
                    );

                    const rectOutline = new Float32Array([
                        this.vertices[0],
                        this.vertices[1],
                        this.vertices[2],
                        this.vertices[3],
                        this.vertices[6],
                        this.vertices[7],
                        this.vertices[4],
                        this.vertices[5],
                    ]);

                    this.gl.bufferData(
                        this.gl.ARRAY_BUFFER,
                        rectOutline,
                        this.gl.STATIC_DRAW,
                    );
                } else {
                    this.gl.bindBuffer(
                        this.gl.ARRAY_BUFFER,
                        this._wireframeBuffer,
                    );
                }

                this.gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexPosition,
                    2,
                    this.gl.FLOAT,
                    false,
                    0,
                    0,
                );
            }
            drawMode = this.gl.LINE_LOOP;
        }

        this._applyBlend();
        this.gl.drawArrays(drawMode, 0, vertexCount);
        this._restoreBlend();
        RenderStats.drawCalls++;
        RenderStats.quads++;

        if (usingMaterial) {
            const standard = GLManager.getProgramInfo();
            if (standard && standard.program) {
                this.gl.useProgram(standard.program);
            }
        }
    }

    /**
     * @method loadImage
     * @description Loads an image
     * @param {string} path - The path to the image
     * @returns {Promise} - The promise
     */
    loadImage(path) {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            image.crossOrigin = "Anonymous";
            image.addEventListener("load", function () {
                resolve(image);
            });
            image.addEventListener("error", function (err) {
                reject(err);
            });
            image.src = path;
        });
    }
}

export default Drawable;
