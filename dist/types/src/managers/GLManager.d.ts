export default GLManager;
/**
 * @class GLManager
 * @description Manages the WebGL context for the game
 */
declare class GLManager {
    /**
     * @method setGL
     * @description Sets the WebGL context
     * @param {WebGLRenderingContext} gl - The WebGL context
     */
    static setGL(gl: WebGLRenderingContext): void;
    /**
     * @method setProgramInfo
     * @description Sets the program info
     * @param {Object} programInfo - The program info
     */
    static setProgramInfo(programInfo: any): void;
    /**
     * @method setCanvas
     * @description Sets the canvas
     * @param {HTMLCanvasElement} canvas - The canvas
     */
    static setCanvas(canvas: HTMLCanvasElement): void;
    /**
     * @method getGL
     * @description Returns the WebGL context
     * @returns {WebGLRenderingContext} - The WebGL context
     */
    static getGL(): WebGLRenderingContext;
    /**
     * @method getProgramInfo
     * @description Returns the program info
     * @returns {Object} - The program info
     */
    static getProgramInfo(): any;
    /**
     * @method getCanvas
     * @description Returns the canvas
     * @returns {HTMLCanvasElement} - The canvas
     */
    static getCanvas(): HTMLCanvasElement;
    /**
     * @method registerRestorable
     * @description Registers an object holding GL resources (buffers, textures,
     * programs) for re-creation after a WebGL context loss. The object must
     * implement `_restoreGL()`. Drawables register themselves automatically and
     * unregister on dispose().
     * @param {Object} obj - An object with a _restoreGL() method
     */
    static registerRestorable(obj: any): void;
    /**
     * @method unregisterRestorable
     * @description Removes an object from the context-restore registry.
     */
    static unregisterRestorable(obj: any): void;
    /**
     * @method restoreAll
     * @description Calls _restoreGL() on every registered object. Invoked by
     * Emerald after the context is restored and the default shaders/textures
     * have been rebuilt.
     */
    static restoreAll(): void;
    /**
     * @method setProjection
     * @description Stores the current camera's projection matrix so custom
     * Materials (which use their own shader program) can upload it.
     * @param {Float32Array} matrix - The projection matrix
     */
    static setProjection(matrix: Float32Array): void;
    /**
     * @method getProjection
     * @description Returns the last projection matrix set by the renderer.
     * @returns {Float32Array}
     */
    static getProjection(): Float32Array;
}
declare namespace GLManager {
    let gl: any;
    let programInfo: any;
    let canvas: any;
    let projection: any;
    let restorables: Set<any>;
}
