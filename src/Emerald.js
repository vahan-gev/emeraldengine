import { STANDARD_FRAGMENT_SHADER, STANDARD_VERTEX_SHADER } from "./Shaders.js";
import { initShaderProgram } from "./GLUtils.js";
import { mat4 } from "gl-matrix";
import Color from "./Color.js";
import Transform from "./Transform.js";
import Camera from "./Camera.js";
import { Vector2, Vector3 } from "./Physics.js";
import Time from "./Time.js";
import GLManager from "./managers/GLManager.js";
import GLState from "./managers/GLState.js";
import TextureManager from "./managers/TextureManager.js";
import RenderStats from "./managers/RenderStats.js";
import CameraManager from "./managers/CameraManager.js";
import PointLight from "./lights/PointLight.js";
import DirectionalLight from "./lights/DirectionalLight.js";
import InstancedTexture from "./InstancedTexture.js";
import Tween from "./Tween.js";
import Timer from "./Timer.js";
import Coroutine from "./Coroutine.js";
import PostProcessor from "./PostProcessor.js";
import RenderTarget from "./RenderTarget.js";

/**
 * @class Emerald
 * @description A class that represents the Emerald engine
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
class Emerald {
  constructor(canvas) {
    const gl = canvas.getContext("webgl2", {
      antialias: true,
      powerPreference: "high-performance",
      desynchronized: false,
    });
    if (!gl) {
      throw new Error(
        "[Emerald.js] > Could not acquire a WebGL2 context. Ensure the canvas is valid and WebGL2 is supported."
      );
    }

    this.gl = gl;
    this._initProgram(gl);
    GLManager.setGL(gl);
    GLManager.setProgramInfo(this.programInfo);
    this._bindContextGuards(canvas);
    this.camera = new Camera();
    this.cameras = [this.camera];

    CameraManager.setCamera(this.camera);

    this.ambientLight = new Vector3(1.0, 1.0, 1.0);
    this.pointLights = [];
    this.directionalLights = [];
    this.debugLogged = false;

    this.cullingEnabled = true;

    /** @private */
    this._drawOrder = [];
    /** @private */
    this._projection = mat4.create();
    /** @private */
    this._view = mat4.create();
    /** @private */
    this._identityView = mat4.create();
    /** @private */
    this._ambient = new Float32Array(3);
    /** @private */
    this._lightPositions = new Float32Array(4 * 2);
    /** @private */
    this._lightColors = new Float32Array(4 * 3);
    /** @private */
    this._lightIntensities = new Float32Array(4);
    /** @private */
    this._lightRadii = new Float32Array(4);
    /** @private */
    this._dirLightPositions = new Float32Array(4 * 2);
    /** @private */
    this._dirLightDirections = new Float32Array(4 * 2);
    /** @private */
    this._dirLightColors = new Float32Array(4 * 3);
    /** @private */
    this._dirLightIntensities = new Float32Array(4);
    /** @private */
    this._dirLightWidths = new Float32Array(4);
    this.backgroundColor = {
      r: 0.0,
      g: 0.0,
      b: 0.0,
      a: 1.0,
    };

    this.postProcessor = null;
    /** @private */
    this._sceneRT = null;

    this.designResolution = null;
    /** @private */
    this._paused = false;
  }

  /**
   * @method _initProgram
   * @description Compiles the standard shader program and caches every attrib
   * and uniform location. Called from the constructor and again after a WebGL
   * context loss is restored (all programs die with the context).
   * @private
   */
  _initProgram(gl) {
    const shaderProgram = initShaderProgram(
      gl,
      STANDARD_VERTEX_SHADER,
      STANDARD_FRAGMENT_SHADER
    );
    this.shaderProgram = shaderProgram;
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        aTexCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        instanceMatrix: gl.getAttribLocation(shaderProgram, "aInstanceMatrix0"),
        instanceTexCoord0: gl.getAttribLocation(shaderProgram, "aInstanceTexCoord0"),
        instanceTexCoord1: gl.getAttribLocation(shaderProgram, "aInstanceTexCoord1"),
        instanceTexCoord2: gl.getAttribLocation(shaderProgram, "aInstanceTexCoord2"),
        instanceTexCoord3: gl.getAttribLocation(shaderProgram, "aInstanceTexCoord3"),
        instanceColor: gl.getAttribLocation(shaderProgram, "aInstanceColor"),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
        globalViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        instancedModelViewMatrix: gl.getUniformLocation(shaderProgram, "uInstancedModelViewMatrix"),
        uModelMatrix: gl.getUniformLocation(shaderProgram, "uModelMatrix"),
        uInstancedModelMatrix: gl.getUniformLocation(shaderProgram, "uInstancedModelMatrix"),
        uAmbientLightValues: gl.getUniformLocation(shaderProgram, "uAmbientLightValues"),
        uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
        color: gl.getUniformLocation(shaderProgram, "uColor"),
        useTexture: gl.getUniformLocation(shaderProgram, "useTexture"),
        useInstances: gl.getUniformLocation(shaderProgram, "useInstances"),
        useText: gl.getUniformLocation(shaderProgram, "useText"),
        useLighting: gl.getUniformLocation(shaderProgram, "uUseLighting"),
        uOpacity: gl.getUniformLocation(shaderProgram, "uOpacity"),
        uLightPosition: gl.getUniformLocation(shaderProgram, "uLightPosition"),
        uLightColor: gl.getUniformLocation(shaderProgram, "uLightColor"),
        uLightIntensity: gl.getUniformLocation(shaderProgram, "uLightIntensity"),
        uLightRadius: gl.getUniformLocation(shaderProgram, "uLightRadius"),
        uActiveLights: gl.getUniformLocation(shaderProgram, "uActiveLights"),
        uDirLightPosition: gl.getUniformLocation(shaderProgram, "uDirLightPosition"),
        uDirLightDirection: gl.getUniformLocation(shaderProgram, "uDirLightDirection"),
        uDirLightColor: gl.getUniformLocation(shaderProgram, "uDirLightColor"),
        uDirLightIntensity: gl.getUniformLocation(shaderProgram, "uDirLightIntensity"),
        uDirLightWidth: gl.getUniformLocation(shaderProgram, "uDirLightWidth"),
        uActiveDirLights: gl.getUniformLocation(shaderProgram, "uActiveDirLights"),
      },
    };
  }

  /**
   * @method _bindContextGuards
   * @description Installs webglcontextlost/restored handlers: on loss the
   * default (context is gone for good) is prevented and rendering pauses; on
   * restore every GPU resource is rebuilt and rendering resumes.
   * @private
   */
  _bindContextGuards(canvas) {
    /** @private */
    this._contextLost = false;
    /** @private */
    this._contextLostHandlers = [];
    /** @private */
    this._contextRestoredHandlers = [];
    /** @private */
    this._onCtxLost = (e) => {
      e.preventDefault();
      this._contextLost = true;
      console.warn("[Emerald] > WebGL context lost — rendering paused until restore.");
      for (const h of this._contextLostHandlers) h();
    };
    /** @private */
    this._onCtxRestored = () => {
      try {
        this._restoreContext();
        console.info("[Emerald] > WebGL context restored.");
      } catch (err) {
        console.error("[Emerald] > Context restore failed:", err);
      }
    };
    canvas.addEventListener("webglcontextlost", this._onCtxLost, false);
    canvas.addEventListener("webglcontextrestored", this._onCtxRestored, false);
  }

  /**
   * @method getRenderStats
   * @description Render counters for the most recent completed frame:
   * { drawCalls, quads, textureBinds }. DebugOverlay shows these automatically.
   * @returns {{drawCalls:number, quads:number, textureBinds:number}}
   */
  getRenderStats() {
    return RenderStats.frame;
  }

  /**
   * @method onContextLost
   * @description Registers a callback fired when the WebGL context is lost
   * (e.g. to show a "please wait" overlay).
   * @param {Function} cb
   * @returns {Emerald} - this
   */
  onContextLost(cb) {
    if (typeof cb === "function") this._contextLostHandlers.push(cb);
    return this;
  }

  /**
   * @method onContextRestored
   * @description Registers a callback fired after the context and all GPU
   * resources have been rebuilt.
   * @param {Function} cb
   * @returns {Emerald} - this
   */
  onContextRestored(cb) {
    if (typeof cb === "function") this._contextRestoredHandlers.push(cb);
    return this;
  }

  /**
   * @method _restoreContext
   * @description Rebuilds everything the GPU forgot: the standard program,
   * cached textures (from the surviving image cache), every registered
   * drawable's buffers, custom Materials, post-processing programs, and the
   * scene render target. Runs on the webglcontextrestored event.
   * @private
   */
  _restoreContext() {
    const gl = this.gl;
    this._initProgram(gl);
    GLManager.setGL(gl);
    GLManager.setProgramInfo(this.programInfo);
    GLState.reset();
    TextureManager.restoreAll();
    GLManager.restoreAll();
    if (this._sceneRT) {
      const canvas = gl.canvas;
      this._sceneRT = new RenderTarget(
        Math.max(2, canvas.width),
        Math.max(2, canvas.height)
      );
    }
    this._contextLost = false;
    for (const h of this._contextRestoredHandlers) h();
  }

  /**
   * @method setDesignResolution
   * @description Makes the world render at a fixed design resolution that is
   * scaled to fit any screen, so the game looks consistent across devices and
   * aspect ratios. Modes:
   *  - "fit"     letterbox: preserve aspect, whole design visible, bars on the sides
   *  - "fill"    cover: preserve aspect, fill the screen, crop the overflow
   *  - "stretch" ignore aspect, stretch the design to the screen
   *  - "pixel"   like "fit" but snapped to an integer scale for crisp pixel art
   * Call this once (and again on orientation change if desired); it composes with
   * `resize`. Use `screenToWorld` for correct picking under any mode.
   * @param {number} width - Design width in world units
   * @param {number} height - Design height in world units
   * @param {string} [mode="fit"] - "fit" | "fill" | "stretch" | "pixel"
   */
  setDesignResolution(width, height, mode = "fit") {
    this.designResolution = { width, height, mode };
  }

  /**
   * @method clearDesignResolution
   * @description Disables design-resolution scaling; the world reverts to using
   * the canvas's CSS pixel size as world units.
   */
  clearDesignResolution() {
    this.designResolution = null;
  }

  /**
   * @method _viewportFor
   * @description Computes the device-pixel GL viewport rect and the world-space
   * extents (`worldW` x `worldH`) for a camera, honoring the active design
   * resolution + fit mode. Without a design resolution it returns the camera's
   * screen sub-rect at the canvas CSS size (legacy behavior).
   * @private
   */
  _viewportFor(camera) {
    const canvas = this.gl.canvas;
    const vp = camera.viewport;
    const rx = vp.x * canvas.width;
    const ry = vp.y * canvas.height;
    const rw = vp.width * canvas.width;
    const rh = vp.height * canvas.height;

    const design = this.designResolution;
    if (!design) {
      return {
        px: Math.floor(rx),
        py: Math.floor(ry),
        pw: Math.floor(rw),
        ph: Math.floor(rh),
        worldW: canvas.clientWidth * vp.width,
        worldH: canvas.clientHeight * vp.height,
      };
    }

    const dw = design.width;
    const dh = design.height;
    const mode = design.mode;

    if (mode === "stretch") {
      return {
        px: Math.floor(rx),
        py: Math.floor(ry),
        pw: Math.floor(rw),
        ph: Math.floor(rh),
        worldW: dw,
        worldH: dh,
      };
    }
    if (mode === "fill") {
      const scale = Math.max(rw / dw, rh / dh);
      return {
        px: Math.floor(rx),
        py: Math.floor(ry),
        pw: Math.floor(rw),
        ph: Math.floor(rh),
        worldW: rw / scale,
        worldH: rh / scale,
      };
    }

    let scale = Math.min(rw / dw, rh / dh);
    if (mode === "pixel") scale = Math.max(1, Math.floor(scale));
    const vw = dw * scale;
    const vh = dh * scale;
    return {
      px: Math.floor(rx + (rw - vw) / 2),
      py: Math.floor(ry + (rh - vh) / 2),
      pw: Math.floor(vw),
      ph: Math.floor(vh),
      worldW: dw,
      worldH: dh,
    };
  }

  /**
   * @method _clientToView
   * @description Maps a client/CSS pixel coordinate to pre-camera view space
   * (origin center, +Y up), honoring DPR, design resolution and fit mode
   * (including letterbox offset). This is also the screen-space coordinate used
   * for `screenSpace` objects. Camera transform is applied separately by
   * `screenToWorld`.
   * @private
   * @returns {{x:number, y:number}}
   */
  _clientToView(clientX, clientY, camera = this.camera) {
    const canvas = this.gl.canvas;
    const rect =
      typeof canvas.getBoundingClientRect === "function"
        ? canvas.getBoundingClientRect()
        : { left: 0, top: 0, width: canvas.clientWidth, height: canvas.clientHeight };

    const sx = (clientX - rect.left) * (canvas.width / (rect.width || 1));
    const sy = (clientY - rect.top) * (canvas.height / (rect.height || 1));
    const gy = canvas.height - sy;

    const { px, py, pw, ph, worldW, worldH } = this._viewportFor(camera);
    const nx = (sx - px) / (pw || 1);
    const ny = (gy - py) / (ph || 1);

    return { x: (nx - 0.5) * worldW, y: (ny - 0.5) * worldH };
  }

  /**
   * @method screenToWorld
   * @description Converts a client/CSS pixel coordinate (e.g. `event.clientX/Y`)
   * to world space for a camera, accounting for device pixel ratio, the active
   * design resolution + fit mode (including letterbox offset), and the camera's
   * position / zoom / rotation. Use this for mouse picking instead of ad-hoc math.
   * @param {number} clientX - Client X (relative to the viewport)
   * @param {number} clientY - Client Y (relative to the viewport)
   * @param {Camera} [camera] - The camera to unproject through (default primary)
   * @returns {Vector2} - World-space position
   */
  screenToWorld(clientX, clientY, camera = this.camera) {
    const { x: vx, y: vy } = this._clientToView(clientX, clientY, camera);

    const zoomX = camera.transform.scale.x || 1;
    const zoomY = camera.transform.scale.y || 1;
    const ux = vx / zoomX;
    const uy = vy / zoomY;

    const rot = -camera.transform.rotation;
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    const wx = ux * c - uy * s - camera.transform.position.x;
    const wy = ux * s + uy * c - camera.transform.position.y;
    return new Vector2(wx, wy);
  }

  /**
   * @method enablePostProcessing
   * @description Turns on the post-processing pipeline (lazily creating the
   * scene render target and processor). Add effects with addPostEffect.
   * @returns {PostProcessor} - The processor (to add/remove effects)
   */
  enablePostProcessing() {
    if (!this.postProcessor) {
      const canvas = this.gl.canvas;
      this._sceneRT = new RenderTarget(canvas.width, canvas.height);
      this.postProcessor = new PostProcessor();
    }
    this.postProcessor.enabled = true;
    return this.postProcessor;
  }

  /**
   * @method disablePostProcessing
   * @description Disables the pipeline (scene renders straight to the canvas).
   */
  disablePostProcessing() {
    if (this.postProcessor) this.postProcessor.enabled = false;
  }

  /**
   * @method addPostEffect
   * @description Appends a post-processing effect (enabling the pipeline if
   * needed). See PostEffects for the built-ins.
   * @param {PostEffect} effect
   * @returns {Emerald} - this
   */
  addPostEffect(effect) {
    this.enablePostProcessing();
    this.postProcessor.addEffect(effect);
    return this;
  }

  /**
   * @method removePostEffect
   * @description Removes a previously added post-processing effect.
   * @param {PostEffect} effect
   * @returns {Emerald} - this
   */
  removePostEffect(effect) {
    if (this.postProcessor) this.postProcessor.removeEffect(effect);
    return this;
  }

  /**
   * @method setAmbientLight
   * @description Sets the ambient light for the scene
   * @param {Vector3} vector3 - The ambient light color as a Vector3 instance
   */
  setAmbientLight(vector3) {
    if (
      vector3 &&
      typeof vector3.x === "number" &&
      typeof vector3.y === "number" &&
      typeof vector3.z === "number"
    ) {
      this.ambientLight = vector3;
    } else {
      console.error(
        "[Emerald.js] > vector3 is not an instance of Vector3 class."
      );
    }
  }

  /**
   * @method resize
   * @description Resizes the canvas
   * @param {number} width - The width of the canvas
   * @param {number} height - The height of the canvas
   * @param {number} [dpr] - Device pixel ratio override; defaults to
   * `window.devicePixelRatio` (or 1 outside a browser)
   */
  resize(width, height, dpr) {
    const ratio =
      dpr || (typeof window !== "undefined" && window.devicePixelRatio) || 1;
    const canvas = this.gl.canvas;

    if (canvas.style) {
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    }
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    this.gl.viewport(0, 0, canvas.width, canvas.height);
  }

  /**
   * @method addPointLight
   * @description Adds a point light to the scene
   * @param {PointLight} pointLight - The point light to add
   */
  addPointLight(pointLight) {
    if (!(pointLight instanceof PointLight)) {
      console.error(
        "[Emerald.js] > Passed argument is not an instance of PointLight class."
      );
      return;
    }
    if (this.pointLights.length < 4) {
      this.pointLights.push(pointLight);
    } else {
      console.warn("Maximum number of point lights reached (4)");
    }
  }

  /**
   * @method addDirectionalLight
   * @description Adds a directional light to the scene
   * @param {DirectionalLight} directionalLight - The directional light to add
   */
  addDirectionalLight(directionalLight) {
    if (!(directionalLight instanceof DirectionalLight)) {
      console.error(
        "[Emerald.js] > Passed argument is not an instance of DirectionalLight class."
      );
      return;
    }
    if (this.directionalLights.length < 4) {
      this.directionalLights.push(directionalLight);
    } else {
      console.warn("Maximum number of directional lights reached (4)");
    }
  }

  /**
   * @method removeDirectionalLight
   * @description Removes a directional light from the scene
   * @param {DirectionalLight} directionalLight - The directional light to remove
   */
  removeDirectionalLight(directionalLight) {
    const index = this.directionalLights.indexOf(directionalLight);
    if (index > -1) {
      this.directionalLights.splice(index, 1);
    }
  }

  /**
   * @method setBackgroundColor
   * @description Sets the background color of the scene
   * @param {Color} color - The background color
   */
  setBackgroundColor(color) {
    if (color instanceof Color) {
      this.backgroundColor = {
        r: color.r / 255,
        g: color.g / 255,
        b: color.b / 255,
        a: color.a / 255,
      };
    } else {
      console.error("[Emerald.js] > color is not an instance of Color class.");
    }
  }


  /**
   * @method run
   * @description Starts an engine-owned game loop on requestAnimationFrame. Each
   * frame it computes a delta time (clamped so a tab-switch stall can't produce
   * a huge jump), optionally advances a fixed-timestep simulation, and calls
   * your `update(dt, alpha)`. `alpha` is the 0..1 interpolation factor between
   * the last and next fixed step (1 when no fixed step is configured), so you
   * can render smoothly between simulation ticks.
   *
   * @param {Function} update - `(dt, alpha) => void`, called once per frame
   * @param {Object} [options]
   * @param {number} [options.maxDelta=0.25] - Max dt (seconds) per frame
   * @param {number} [options.fixedStep=0] - Fixed simulation step in seconds
   *   (e.g. 1/60). 0 disables the fixed loop.
   * @param {Function} [options.fixedUpdate] - `(step) => void`, called 0..N
   *   times per frame to advance the fixed-timestep simulation
   * @param {number} [options.maxSubSteps=5] - Cap on fixed steps per frame
   * @param {boolean} [options.pauseOnBlur=true] - Auto-pause when the tab is
   *   hidden/minimized (and on window blur if `pauseOnWindowBlur` is set)
   * @param {boolean} [options.pauseOnWindowBlur=false] - Also pause on window blur
   * @param {Function} [options.onPause] - Called when the loop pauses
   * @param {Function} [options.onResume] - Called when the loop resumes
   * @returns {Function} - A stop function (same as calling `stop()`)
   */
  run(update, options = {}) {
    const raf =
      typeof globalThis !== "undefined" && globalThis.requestAnimationFrame
        ? globalThis.requestAnimationFrame.bind(globalThis)
        : null;
    if (!raf) {
      throw new Error(
        "[Emerald.js] > run() requires requestAnimationFrame (browser environment)."
      );
    }

    const maxDelta = options.maxDelta ?? 0.25;
    const fixedStep = options.fixedStep ?? 0;
    const fixedUpdate = options.fixedUpdate || null;
    const maxSubSteps = options.maxSubSteps ?? 5;

    /** @private */
    this._running = true;
    this._paused = false;
    /** @private */
    this._loopLastTime = 0;
    /** @private */
    this._fixedAccumulator = 0;
    /** @private */
    this._onPause = options.onPause || null;
    /** @private */
    this._onResume = options.onResume || null;
    this._bindLifecycle(options);

    const frame = (now) => {
      if (!this._running) return;
      if (this._paused || this._contextLost) {
        this._loopLastTime = now;
        /** @private */
        this._rafId = raf(frame);
        return;
      }
      if (this._loopLastTime === 0) this._loopLastTime = now;
      let dt = (now - this._loopLastTime) / 1000;
      this._loopLastTime = now;
      if (!isFinite(dt) || dt < 0) dt = 0;
      if (dt > maxDelta) dt = maxDelta;

      let alpha = 1;
      if (fixedStep > 0 && fixedUpdate) {
        this._fixedAccumulator += dt;
        let steps = 0;
        while (this._fixedAccumulator >= fixedStep && steps < maxSubSteps) {
          fixedUpdate(fixedStep);
          this._fixedAccumulator -= fixedStep;
          steps++;
        }
        if (steps === maxSubSteps) this._fixedAccumulator = 0;
        alpha = this._fixedAccumulator / fixedStep;
      }

      update(dt, alpha);
      this._rafId = raf(frame);
    };

    this._rafId = raf(frame);
    return () => this.stop();
  }

  /**
   * @method stop
   * @description Stops a loop previously started with run().
   */
  stop() {
    this._running = false;
    this._unbindLifecycle();
    if (
      this._rafId != null &&
      typeof globalThis !== "undefined" &&
      globalThis.cancelAnimationFrame
    ) {
      globalThis.cancelAnimationFrame(this._rafId);
    }
    this._rafId = null;
  }

  /**
   * @method pause
   * @description Pauses the loop: `update`/`fixedUpdate` stop being called while
   * the RAF keeps spinning. Time doesn't accumulate, so resuming produces no dt
   * spike. Fires the `onPause` callback once.
   */
  pause() {
    if (this._paused) return;
    this._paused = true;
    if (this._onPause) this._onPause();
  }

  /**
   * @method resume
   * @description Resumes a paused loop and resyncs the clock so the first frame
   * after resuming has ~0 dt. Fires the `onResume` callback once.
   */
  resume() {
    if (!this._paused) return;
    this._paused = false;
    this._loopLastTime = 0;
    if (this._onResume) this._onResume();
  }

  /**
   * @method _bindLifecycle
   * @description Wires visibility/blur listeners that auto-pause the loop when
   * the page is backgrounded, per the `run` options.
   * @private
   */
  _bindLifecycle(options) {
    this._unbindLifecycle();
    const pauseOnBlur = options.pauseOnBlur ?? true;
    if (!pauseOnBlur) return;

    if (typeof document !== "undefined" && document.addEventListener) {
      /** @private */
      this._onVisibility = () => {
        if (document.hidden) this.pause();
        else this.resume();
      };
      document.addEventListener("visibilitychange", this._onVisibility);
    }
    if (
      options.pauseOnWindowBlur &&
      typeof window !== "undefined" &&
      window.addEventListener
    ) {
      /** @private */
      this._onWinBlur = () => this.pause();
      /** @private */
      this._onWinFocus = () => this.resume();
      window.addEventListener("blur", this._onWinBlur);
      window.addEventListener("focus", this._onWinFocus);
    }
  }

  /**
   * @method _unbindLifecycle
   * @description Removes any listeners registered by `_bindLifecycle`.
   * @private
   */
  _unbindLifecycle() {
    if (this._onVisibility && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this._onVisibility);
      this._onVisibility = null;
    }
    if (this._onWinBlur && typeof window !== "undefined") {
      window.removeEventListener("blur", this._onWinBlur);
      window.removeEventListener("focus", this._onWinFocus);
      this._onWinBlur = null;
      this._onWinFocus = null;
    }
  }

  /**
   * @method drawScene
   * @description Draws the scene
   * @param {Scene} scene - The scene to draw
   * @param {number} deltaTime - The delta time
   */
  drawScene(scene, deltaTime) {
    if (this._contextLost) return;
    RenderStats.beginFrame();
    Time.setDeltaTime(deltaTime);

    const scaledDelta = Time.getDeltaTime();
    Tween.update(scaledDelta);
    Timer.update(scaledDelta);
    Coroutine.update(scaledDelta);

    for (let i = 0; i < scene.objects.length; i++) {
      const object = scene.objects[i];
      if (object && typeof object.syncPhysics === "function") {
        object.syncPhysics();
      }
    }

    const gl = this.gl;
    const canvas = gl.canvas;

    const usePost = this.postProcessor && this.postProcessor.hasEffects();
    if (usePost) {
      this._sceneRT.resize(canvas.width, canvas.height);
      this._sceneRT.bind();
    }

    gl.clearDepth(1.0);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA
    );

    const bg = this.backgroundColor || { r: 0, g: 0, b: 0, a: 1 };
    gl.disable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(bg.r, bg.g, bg.b, bg.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.programInfo.program);
    GLState.reset();

    const order = this._drawOrder;
    order.length = scene.objects.length;
    for (let i = 0; i < scene.objects.length; i++) {
      order[i] = scene.objects[i];
    }
    order.sort(
      (a, b) =>
        (a.layer || 0) - (b.layer || 0) ||
        a.transform.position.z - b.transform.position.z
    );

    const now = performance.now();

    const postExcluded = [];
    for (const camera of this.cameras) {
      if (!camera || !camera.active) continue;
      if (usePost && camera.excludeFromPost) {
        postExcluded.push(camera);
        continue;
      }
      this._renderCamera(camera, order, now);
    }

    gl.disable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, canvas.width, canvas.height);

    if (usePost) {
      this._sceneRT.unbind();
      this.postProcessor.process(
        this._sceneRT.texture,
        canvas.width,
        canvas.height,
        now / 1000
      );

      if (postExcluded.length) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(
          gl.SRC_ALPHA,
          gl.ONE_MINUS_SRC_ALPHA,
          gl.ONE,
          gl.ONE_MINUS_SRC_ALPHA
        );
        gl.useProgram(this.programInfo.program);
        GLState.reset();
        for (const camera of postExcluded) {
          this._renderCamera(camera, order, now);
        }
        gl.disable(gl.SCISSOR_TEST);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }
  }

  /**
   * @method _renderCamera
   * @description Renders the sorted draw order through a single camera into its
   * viewport rectangle.
   * @private
   */
  _renderCamera(camera, order, now) {
    const gl = this.gl;
    const canvas = gl.canvas;

    const { px, py, pw, ph, worldW, worldH } = this._viewportFor(camera);
    gl.viewport(px, py, pw, ph);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(px, py, pw, ph);

    if (camera.clearColor) {
      const c = camera.clearColor;
      gl.clearColor(c.r / 255, c.g / 255, c.b / 255, c.a / 255);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    const cssW = worldW;
    const cssH = worldH;
    const projectionMatrix = this._projection;
    mat4.ortho(projectionMatrix, -cssW / 2, cssW / 2, -cssH / 2, cssH / 2, -100, 100);
    GLManager.setProjection(projectionMatrix);

    const view = this._view;
    mat4.identity(view);
    mat4.scale(view, view, [
      camera.transform.scale.x,
      camera.transform.scale.y,
      1,
    ]);
    mat4.rotate(view, view, camera.transform.rotation, [0, 0, 1]);
    let camTX = camera.transform.position.x;
    let camTY = camera.transform.position.y;
    if (camera.pixelSnap && camera.transform.rotation === 0) {
      const zx = camera.transform.scale.x || 1;
      const zy = camera.transform.scale.y || 1;
      camTX = Math.round(camTX * zx) / zx;
      camTY = Math.round(camTY * zy) / zy;
    }
    mat4.translate(view, view, [
      camTX,
      camTY,
      camera.transform.position.z,
    ]);

    this._ambient[0] = this.ambientLight.x;
    this._ambient[1] = this.ambientLight.y;
    this._ambient[2] = this.ambientLight.z;
    gl.uniform3fv(
      this.programInfo.uniformLocations.uAmbientLightValues,
      this._ambient
    );
    gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.globalViewMatrix,
      false,
      view
    );
    gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.instancedModelViewMatrix,
      false,
      view
    );

    const camX = camera.transform.position.x;
    const camY = camera.transform.position.y;
    const zoom = camera.transform.scale.x || 1;

    const pointCount = Math.min(this.pointLights.length, 4);
    for (let i = 0; i < pointCount; i++) {
      const light = this.pointLights[i];
      this._lightPositions[i * 2] = (light.position.x + camX) * zoom;
      this._lightPositions[i * 2 + 1] = (light.position.y + camY) * zoom;
      this._lightColors[i * 3] = light.color.r / 255;
      this._lightColors[i * 3 + 1] = light.color.g / 255;
      this._lightColors[i * 3 + 2] = light.color.b / 255;
      this._lightIntensities[i] = light.intensity;
      this._lightRadii[i] = light.radius * zoom;
    }
    if (pointCount > 0) {
      gl.uniform2fv(
        this.programInfo.uniformLocations.uLightPosition,
        this._lightPositions
      );
      gl.uniform3fv(
        this.programInfo.uniformLocations.uLightColor,
        this._lightColors
      );
      gl.uniform1fv(
        this.programInfo.uniformLocations.uLightIntensity,
        this._lightIntensities
      );
      gl.uniform1fv(
        this.programInfo.uniformLocations.uLightRadius,
        this._lightRadii
      );
    }
    gl.uniform1i(this.programInfo.uniformLocations.uActiveLights, pointCount);

    const dirCount = Math.min(this.directionalLights.length, 4);
    for (let i = 0; i < dirCount; i++) {
      const light = this.directionalLights[i];
      this._dirLightPositions[i * 2] = (light.position.x + camX) * zoom;
      this._dirLightPositions[i * 2 + 1] = (light.position.y + camY) * zoom;
      this._dirLightDirections[i * 2] = light.direction.x;
      this._dirLightDirections[i * 2 + 1] = light.direction.y;
      this._dirLightColors[i * 3] = light.color.r / 255;
      this._dirLightColors[i * 3 + 1] = light.color.g / 255;
      this._dirLightColors[i * 3 + 2] = light.color.b / 255;
      this._dirLightIntensities[i] = light.intensity;
      this._dirLightWidths[i] = light.width * zoom;
    }
    if (dirCount > 0) {
      gl.uniform2fv(
        this.programInfo.uniformLocations.uDirLightPosition,
        this._dirLightPositions
      );
      gl.uniform2fv(
        this.programInfo.uniformLocations.uDirLightDirection,
        this._dirLightDirections
      );
      gl.uniform3fv(
        this.programInfo.uniformLocations.uDirLightColor,
        this._dirLightColors
      );
      gl.uniform1fv(
        this.programInfo.uniformLocations.uDirLightIntensity,
        this._dirLightIntensities
      );
      gl.uniform1fv(
        this.programInfo.uniformLocations.uDirLightWidth,
        this._dirLightWidths
      );
    }
    gl.uniform1i(this.programInfo.uniformLocations.uActiveDirLights, dirCount);

    const halfW = cssW / 2 / zoom;
    const halfH = cssH / 2 / zoom;
    const viewLeft = -camX - halfW;
    const viewRight = -camX + halfW;
    const viewBottom = -camY - halfH;
    const viewTop = -camY + halfH;

    const ignoreLayers = camera.ignoreLayers;
    const onlyLayers = camera.onlyLayers;
    for (const object of order) {
      const objLayer = object.layer || 0;
      if (onlyLayers && !onlyLayers.has(objLayer)) {
        continue;
      }
      if (ignoreLayers && ignoreLayers.size && ignoreLayers.has(objLayer)) {
        continue;
      }
      if (
        this.cullingEnabled &&
        !object.screenSpace &&
        !this._isVisible(object, viewLeft, viewRight, viewBottom, viewTop)
      ) {
        continue;
      }
      const objView = object.screenSpace ? this._identityView : view;
      object.draw(
        objView,
        this.programInfo.uniformLocations.globalViewMatrix,
        now
      );
    }
  }

  /**
   * @method addCamera
   * @description Adds a camera to the render list (for split-screen, etc.).
   * @param {Camera} camera - The camera to add
   */
  addCamera(camera) {
    if (this.cameras.indexOf(camera) === -1) this.cameras.push(camera);
  }

  /**
   * @method removeCamera
   * @description Removes a camera from the render list.
   * @param {Camera} camera - The camera to remove
   */
  removeCamera(camera) {
    const idx = this.cameras.indexOf(camera);
    if (idx !== -1) this.cameras.splice(idx, 1);
  }

  /**
   * @method setCameras
   * @description Replaces the camera list. The first camera becomes the primary
   * `this.camera`.
   * @param {Camera[]} cameras - The cameras to render
   */
  setCameras(cameras) {
    this.cameras = cameras.slice();
    if (this.cameras.length > 0) {
      this.camera = this.cameras[0];
      CameraManager.setCamera(this.camera);
    }
  }

  /**
   * @method setCullingEnabled
   * @description Enables or disables off-screen object culling.
   * @param {boolean} enabled - Whether culling is enabled
   */
  setCullingEnabled(enabled) {
    this.cullingEnabled = enabled;
  }

  /**
   * @method _isVisible
   * @description Conservative AABB visibility test against the view rectangle.
   * Instanced objects (whose instances spread beyond the owner transform) and
   * objects flagged `alwaysVisible` are never culled.
   * @private
   */
  _isVisible(object, left, right, bottom, top) {
    if (!object || !object.transform) return true;
    if (object.alwaysVisible) return true;
    if (object.transform.parent) return true;
    if (object.getComponent && object.getComponent(InstancedTexture)) {
      return true;
    }

    const pos = object.transform.position;
    const scale = object.transform.scale;
    const half =
      Math.max(Math.abs(scale.x), Math.abs(scale.y)) * 1.5;

    return !(
      pos.x + half < left ||
      pos.x - half > right ||
      pos.y + half < bottom ||
      pos.y - half > top
    );
  }
}

export default Emerald;
