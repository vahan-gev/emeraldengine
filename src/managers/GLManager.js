/**
 * @class GLManager
 * @description Manages the WebGL context for the game
 */
class GLManager {
  /**
   * @method setGL
   * @description Sets the WebGL context
   * @param {WebGLRenderingContext} gl - The WebGL context
   */
  static setGL(gl) {
    GLManager.gl = gl;
  }

  /**
   * @method setProgramInfo
   * @description Sets the program info
   * @param {Object} programInfo - The program info
   */
  static setProgramInfo(programInfo) {
    GLManager.programInfo = programInfo;
  }

  /**
   * @method setCanvas
   * @description Sets the canvas
   * @param {HTMLCanvasElement} canvas - The canvas
   */
  static setCanvas(canvas) {
    GLManager.canvas = canvas;
  }

  /**
   * @method getGL
   * @description Returns the WebGL context
   * @returns {WebGLRenderingContext} - The WebGL context
   */
  static getGL() {
    return GLManager.gl;
  }

  /**
   * @method getProgramInfo
   * @description Returns the program info
   * @returns {Object} - The program info
   */
  static getProgramInfo() {
    return GLManager.programInfo;
  }

  /**
   * @method getCanvas
   * @description Returns the canvas
   * @returns {HTMLCanvasElement} - The canvas
   */
  static getCanvas() {
    return GLManager.canvas;
  }

  /**
   * @method registerRestorable
   * @description Registers an object holding GL resources (buffers, textures,
   * programs) for re-creation after a WebGL context loss. The object must
   * implement `_restoreGL()`. Drawables register themselves automatically and
   * unregister on dispose().
   * @param {Object} obj - An object with a _restoreGL() method
   */
  static registerRestorable(obj) {
    GLManager.restorables.add(obj);
  }

  /**
   * @method unregisterRestorable
   * @description Removes an object from the context-restore registry.
   */
  static unregisterRestorable(obj) {
    GLManager.restorables.delete(obj);
  }

  /**
   * @method restoreAll
   * @description Calls _restoreGL() on every registered object. Invoked by
   * Emerald after the context is restored and the default shaders/textures
   * have been rebuilt.
   */
  static restoreAll() {
    for (const obj of GLManager.restorables) {
      try {
        obj._restoreGL();
      } catch (e) {
        console.error("[GLManager] > restore failed for", obj, e);
      }
    }
  }

  /**
   * @method setProjection
   * @description Stores the current camera's projection matrix so custom
   * Materials (which use their own shader program) can upload it.
   * @param {Float32Array} matrix - The projection matrix
   */
  static setProjection(matrix) {
    GLManager.projection = matrix;
  }

  /**
   * @method getProjection
   * @description Returns the last projection matrix set by the renderer.
   * @returns {Float32Array}
   */
  static getProjection() {
    return GLManager.projection;
  }
}

GLManager.gl = null;
GLManager.programInfo = null;
GLManager.canvas = null;
GLManager.projection = null;
GLManager.restorables = new Set();

export default GLManager;
