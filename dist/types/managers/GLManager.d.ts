/**
 * @class GLManager
 * @description Manages the WebGL context for the game
 */
declare class GLManager {
    static gl: WebGL2RenderingContext | null;
    static programInfo: any | null;
    static canvas: HTMLCanvasElement | null;
    /**
     * @method setGL
     * @description Sets the WebGL context
     * @param {WebGLRenderingContext} gl - The WebGL context
     */
    static setGL(gl: WebGL2RenderingContext): void;
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
    static getGL(): WebGL2RenderingContext | null;
    /**
     * @method getProgramInfo
     * @description Returns the program info
     * @returns {Object} - The program info
     */
    static getProgramInfo(): any | null;
    /**
     * @method getCanvas
     * @description Returns the canvas
     * @returns {HTMLCanvasElement} - The canvas
     */
    static getCanvas(): HTMLCanvasElement | null;
}
export default GLManager;
//# sourceMappingURL=GLManager.d.ts.map