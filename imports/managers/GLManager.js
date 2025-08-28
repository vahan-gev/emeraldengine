/**
 * @class GLManager
 * @description Manages the WebGL context for the game
 */
class GLManager {
  static gl = null;
  static programInfo = null;
  static canvas = null;

  /**
   * @method setGL
   * @description Sets the WebGL context
   * @param {WebGLRenderingContext} gl - The WebGL context
   */
  static setGL(gl) {
    this.gl = gl;
  }

  /**
   * @method setProgramInfo
   * @description Sets the program info
   * @param {Object} programInfo - The program info
   */
  static setProgramInfo(programInfo) {
    this.programInfo = programInfo;
  }

  /**
   * @method setCanvas
   * @description Sets the canvas
   * @param {HTMLCanvasElement} canvas - The canvas
   */
  static setCanvas(canvas) {
    this.canvas = canvas;
  }

  /**
   * @method getGL
   * @description Returns the WebGL context
   * @returns {WebGLRenderingContext} - The WebGL context
   */
  static getGL() {
    return this.gl;
  }

  /**
   * @method getProgramInfo
   * @description Returns the program info
   * @returns {Object} - The program info
   */
  static getProgramInfo() {
    return this.programInfo;
  }

  /**
   * @method getCanvas
   * @description Returns the canvas
   * @returns {HTMLCanvasElement} - The canvas
   */
  static getCanvas() {
    return this.canvas;
  }
}

export default GLManager;
