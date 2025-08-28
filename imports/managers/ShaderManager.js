/**
 * @class ShaderManager
 * @description Manages the shaders for the game
 */
export class ShaderManager {
  constructor(gl) {
    this.gl = gl;
    this.shaders = new Map();
    this.activeShader = null;
  }

  /**
   * @method createShader
   * @description Creates a shader
   * @param {string} name - The name of the shader
   * @param {string} vertexSource - The vertex shader source
   * @param {string} fragmentSource - The fragment shader source
   */
  createShader(name, vertexSource, fragmentSource) {
    const vertexShader = this.compileShader(
      vertexSource,
      this.gl.VERTEX_SHADER
    );
    const fragmentShader = this.compileShader(
      fragmentSource,
      this.gl.FRAGMENT_SHADER
    );

    const shaderProgram = this.gl.createProgram();
    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);
    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      console.error(
        "Error linking shader program:",
        this.gl.getProgramInfoLog(shaderProgram)
      );
      this.gl.deleteProgram(shaderProgram);
      return null;
    }

    const programInfo = {
      program: shaderProgram,
      attribLocations: this.getAttributeLocations(shaderProgram),
      uniformLocations: this.getUniformLocations(shaderProgram),
    };

    this.shaders.set(name, programInfo);

    return programInfo;
  }

  /**
   * @method compileShader
   * @description Compiles a shader
   * @param {string} source - The shader source
   * @param {number} type - The type of shader
   */
  compileShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(
        "Shader compilation error:",
        this.gl.getShaderInfoLog(shader)
      );
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * @method useShader
   * @description Uses a shader
   * @param {string} name - The name of the shader
   */
  useShader(name) {
    const shader = this.shaders.get(name);
    if (shader) {
      this.gl.useProgram(shader.program);
      this.activeShader = shader;
    } else {
      console.warn(`Shader ${name} not found.`);
    }

    return shader;
  }

  /**
   * @method getActiveShader
   * @description Returns the active shader
   * @returns {Object} - The active shader
   */
  getActiveShader() {
    return this.activeShader;
  }

  /**
   * @method getAttributeLocations
   * @description Returns the attribute locations for a shader program
   * @param {WebGLProgram} program - The shader program
   * @returns {Object} - The attribute locations
   */
  getAttributeLocations(program) {
    return {
      vertexPosition: this.gl.getAttribLocation(program, "aVertexPosition"),
      textureCoord: this.gl.getAttribLocation(program, "aTextureCoord"),
      // Add other attributes as needed
    };
  }

  /**
   * @method getUniformLocations
   * @description Returns the uniform locations for a shader program
   * @param {WebGLProgram} program - The shader program
   * @returns {Object} - The uniform locations
   */
  getUniformLocations(program) {
    return {
      projectionMatrix: this.gl.getUniformLocation(
        program,
        "uProjectionMatrix"
      ),
      modelViewMatrix: this.gl.getUniformLocation(program, "uModelViewMatrix"),
      sampler: this.gl.getUniformLocation(program, "uSampler"),
      // Add other uniforms as needed
    };
  }
}
