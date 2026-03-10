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
}

GLManager.gl = null;
GLManager.programInfo = null;
GLManager.canvas = null;

export default GLManager;
