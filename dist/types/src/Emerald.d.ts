export default Emerald;
/**
 * @class Emerald
 * @description A class that represents the Emerald engine
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
declare class Emerald {
    constructor(canvas: any);
    gl: any;
    camera: Camera;
    cameras: Camera[];
    ambientLight: Vector3;
    pointLights: any[];
    directionalLights: any[];
    debugLogged: boolean;
    cullingEnabled: boolean;
    /** @private */
    private _drawOrder;
    /** @private */
    private _projection;
    /** @private */
    private _view;
    /** @private */
    private _identityView;
    /** @private */
    private _ambient;
    /** @private */
    private _lightPositions;
    /** @private */
    private _lightColors;
    /** @private */
    private _lightIntensities;
    /** @private */
    private _lightRadii;
    /** @private */
    private _dirLightPositions;
    /** @private */
    private _dirLightDirections;
    /** @private */
    private _dirLightColors;
    /** @private */
    private _dirLightIntensities;
    /** @private */
    private _dirLightWidths;
    backgroundColor: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    postProcessor: PostProcessor;
    /** @private */
    private _sceneRT;
    designResolution: {
        width: number;
        height: number;
        mode: string;
    };
    /** @private */
    private _paused;
    /**
     * @method _initProgram
     * @description Compiles the standard shader program and caches every attrib
     * and uniform location. Called from the constructor and again after a WebGL
     * context loss is restored (all programs die with the context).
     * @private
     */
    private _initProgram;
    shaderProgram: any;
    programInfo: {
        program: any;
        attribLocations: {
            vertexPosition: any;
            aTexCoord: any;
            instanceMatrix: any;
            instanceTexCoord0: any;
            instanceTexCoord1: any;
            instanceTexCoord2: any;
            instanceTexCoord3: any;
            instanceColor: any;
        };
        uniformLocations: {
            projectionMatrix: any;
            globalViewMatrix: any;
            instancedModelViewMatrix: any;
            uModelMatrix: any;
            uInstancedModelMatrix: any;
            uAmbientLightValues: any;
            uSampler: any;
            color: any;
            useTexture: any;
            useInstances: any;
            useText: any;
            useLighting: any;
            uOpacity: any;
            uLightPosition: any;
            uLightColor: any;
            uLightIntensity: any;
            uLightRadius: any;
            uActiveLights: any;
            uDirLightPosition: any;
            uDirLightDirection: any;
            uDirLightColor: any;
            uDirLightIntensity: any;
            uDirLightWidth: any;
            uActiveDirLights: any;
        };
    };
    /**
     * @method _bindContextGuards
     * @description Installs webglcontextlost/restored handlers: on loss the
     * default (context is gone for good) is prevented and rendering pauses; on
     * restore every GPU resource is rebuilt and rendering resumes.
     * @private
     */
    private _bindContextGuards;
    /** @private */
    private _contextLost;
    /** @private */
    private _contextLostHandlers;
    /** @private */
    private _contextRestoredHandlers;
    /** @private */
    private _onCtxLost;
    /** @private */
    private _onCtxRestored;
    /**
     * @method getRenderStats
     * @description Render counters for the most recent completed frame:
     * { drawCalls, quads, textureBinds }. DebugOverlay shows these automatically.
     * @returns {{drawCalls:number, quads:number, textureBinds:number}}
     */
    getRenderStats(): {
        drawCalls: number;
        quads: number;
        textureBinds: number;
    };
    /**
     * @method onContextLost
     * @description Registers a callback fired when the WebGL context is lost
     * (e.g. to show a "please wait" overlay).
     * @param {Function} cb
     * @returns {Emerald} - this
     */
    onContextLost(cb: Function): Emerald;
    /**
     * @method onContextRestored
     * @description Registers a callback fired after the context and all GPU
     * resources have been rebuilt.
     * @param {Function} cb
     * @returns {Emerald} - this
     */
    onContextRestored(cb: Function): Emerald;
    /**
     * @method _restoreContext
     * @description Rebuilds everything the GPU forgot: the standard program,
     * cached textures (from the surviving image cache), every registered
     * drawable's buffers, custom Materials, post-processing programs, and the
     * scene render target. Runs on the webglcontextrestored event.
     * @private
     */
    private _restoreContext;
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
    setDesignResolution(width: number, height: number, mode?: string): void;
    /**
     * @method clearDesignResolution
     * @description Disables design-resolution scaling; the world reverts to using
     * the canvas's CSS pixel size as world units.
     */
    clearDesignResolution(): void;
    /**
     * @method _viewportFor
     * @description Computes the device-pixel GL viewport rect and the world-space
     * extents (`worldW` x `worldH`) for a camera, honoring the active design
     * resolution + fit mode. Without a design resolution it returns the camera's
     * screen sub-rect at the canvas CSS size (legacy behavior).
     * @private
     */
    private _viewportFor;
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
    private _clientToView;
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
    screenToWorld(clientX: number, clientY: number, camera?: Camera): Vector2;
    /**
     * @method enablePostProcessing
     * @description Turns on the post-processing pipeline (lazily creating the
     * scene render target and processor). Add effects with addPostEffect.
     * @returns {PostProcessor} - The processor (to add/remove effects)
     */
    enablePostProcessing(): PostProcessor;
    /**
     * @method disablePostProcessing
     * @description Disables the pipeline (scene renders straight to the canvas).
     */
    disablePostProcessing(): void;
    /**
     * @method addPostEffect
     * @description Appends a post-processing effect (enabling the pipeline if
     * needed). See PostEffects for the built-ins.
     * @param {PostEffect} effect
     * @returns {Emerald} - this
     */
    addPostEffect(effect: PostEffect): Emerald;
    /**
     * @method removePostEffect
     * @description Removes a previously added post-processing effect.
     * @param {PostEffect} effect
     * @returns {Emerald} - this
     */
    removePostEffect(effect: PostEffect): Emerald;
    /**
     * @method setAmbientLight
     * @description Sets the ambient light for the scene
     * @param {Vector3} vector3 - The ambient light color as a Vector3 instance
     */
    setAmbientLight(vector3: Vector3): void;
    /**
     * @method resize
     * @description Resizes the canvas
     * @param {number} width - The width of the canvas
     * @param {number} height - The height of the canvas
     * @param {number} [dpr] - Device pixel ratio override; defaults to
     * `window.devicePixelRatio` (or 1 outside a browser)
     */
    resize(width: number, height: number, dpr?: number): void;
    /**
     * @method addPointLight
     * @description Adds a point light to the scene
     * @param {PointLight} pointLight - The point light to add
     */
    addPointLight(pointLight: PointLight): void;
    /**
     * @method addDirectionalLight
     * @description Adds a directional light to the scene
     * @param {DirectionalLight} directionalLight - The directional light to add
     */
    addDirectionalLight(directionalLight: DirectionalLight): void;
    /**
     * @method removeDirectionalLight
     * @description Removes a directional light from the scene
     * @param {DirectionalLight} directionalLight - The directional light to remove
     */
    removeDirectionalLight(directionalLight: DirectionalLight): void;
    /**
     * @method setBackgroundColor
     * @description Sets the background color of the scene
     * @param {Color} color - The background color
     */
    setBackgroundColor(color: Color): void;
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
    run(update: Function, options?: {
        maxDelta?: number;
        fixedStep?: number;
        fixedUpdate?: Function;
        maxSubSteps?: number;
        pauseOnBlur?: boolean;
        pauseOnWindowBlur?: boolean;
        onPause?: Function;
        onResume?: Function;
    }): Function;
    /** @private */
    private _running;
    /** @private */
    private _loopLastTime;
    /** @private */
    private _fixedAccumulator;
    /** @private */
    private _onPause;
    /** @private */
    private _onResume;
    /** @private */
    private _rafId;
    /**
     * @method stop
     * @description Stops a loop previously started with run().
     */
    stop(): void;
    /**
     * @method pause
     * @description Pauses the loop: `update`/`fixedUpdate` stop being called while
     * the RAF keeps spinning. Time doesn't accumulate, so resuming produces no dt
     * spike. Fires the `onPause` callback once.
     */
    pause(): void;
    /**
     * @method resume
     * @description Resumes a paused loop and resyncs the clock so the first frame
     * after resuming has ~0 dt. Fires the `onResume` callback once.
     */
    resume(): void;
    /**
     * @method _bindLifecycle
     * @description Wires visibility/blur listeners that auto-pause the loop when
     * the page is backgrounded, per the `run` options.
     * @private
     */
    private _bindLifecycle;
    /** @private */
    private _onVisibility;
    /** @private */
    private _onWinBlur;
    /** @private */
    private _onWinFocus;
    /**
     * @method _unbindLifecycle
     * @description Removes any listeners registered by `_bindLifecycle`.
     * @private
     */
    private _unbindLifecycle;
    /**
     * @method drawScene
     * @description Draws the scene
     * @param {Scene} scene - The scene to draw
     * @param {number} deltaTime - The delta time
     */
    drawScene(scene: Scene, deltaTime: number): void;
    /**
     * @method _renderCamera
     * @description Renders the sorted draw order through a single camera into its
     * viewport rectangle.
     * @private
     */
    private _renderCamera;
    /**
     * @method addCamera
     * @description Adds a camera to the render list (for split-screen, etc.).
     * @param {Camera} camera - The camera to add
     */
    addCamera(camera: Camera): void;
    /**
     * @method removeCamera
     * @description Removes a camera from the render list.
     * @param {Camera} camera - The camera to remove
     */
    removeCamera(camera: Camera): void;
    /**
     * @method setCameras
     * @description Replaces the camera list. The first camera becomes the primary
     * `this.camera`.
     * @param {Camera[]} cameras - The cameras to render
     */
    setCameras(cameras: Camera[]): void;
    /**
     * @method setCullingEnabled
     * @description Enables or disables off-screen object culling.
     * @param {boolean} enabled - Whether culling is enabled
     */
    setCullingEnabled(enabled: boolean): void;
    /**
     * @method _isVisible
     * @description Conservative AABB visibility test against the view rectangle.
     * Instanced objects (whose instances spread beyond the owner transform) and
     * objects flagged `alwaysVisible` are never culled.
     * @private
     */
    private _isVisible;
}
import Camera from "./Camera.js";
import { Vector3 } from "./Physics.js";
import PostProcessor from "./PostProcessor.js";
import { Vector2 } from "./Physics.js";
import PointLight from "./lights/PointLight.js";
import DirectionalLight from "./lights/DirectionalLight.js";
import Color from "./Color.js";
