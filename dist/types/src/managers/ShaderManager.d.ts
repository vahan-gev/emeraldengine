/**
 * @class ShaderManager
 * @description Manages the shaders for the game
 */
export class ShaderManager {
    constructor(gl: any);
    gl: any;
    shaders: Map<any, any>;
    activeShader: any;
    /**
     * @method createShader
     * @description Creates a shader
     * @param {string} name - The name of the shader
     * @param {string} vertexSource - The vertex shader source
     * @param {string} fragmentSource - The fragment shader source
     */
    createShader(name: string, vertexSource: string, fragmentSource: string): {
        program: any;
        attribLocations: any;
        uniformLocations: any;
    };
    /**
     * @method compileShader
     * @description Compiles a shader
     * @param {string} source - The shader source
     * @param {number} type - The type of shader
     */
    compileShader(source: string, type: number): any;
    /**
     * @method useShader
     * @description Uses a shader
     * @param {string} name - The name of the shader
     */
    useShader(name: string): any;
    /**
     * @method getActiveShader
     * @description Returns the active shader
     * @returns {Object} - The active shader
     */
    getActiveShader(): any;
    /**
     * @method getAttributeLocations
     * @description Returns the attribute locations for a shader program
     * @param {WebGLProgram} program - The shader program
     * @returns {Object} - The attribute locations
     */
    getAttributeLocations(program: WebGLProgram): any;
    /**
     * @method getUniformLocations
     * @description Returns the uniform locations for a shader program
     * @param {WebGLProgram} program - The shader program
     * @returns {Object} - The uniform locations
     */
    getUniformLocations(program: WebGLProgram): any;
}
