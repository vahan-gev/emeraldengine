import { initShaderProgram } from "./GLUtils.js";
import { STANDARD_VERTEX_SHADER } from "./Shaders.js";
import GLManager from "./managers/GLManager.js";

const MATERIAL_FRAGMENT_HEADER = `
  #ifdef GL_ES
  precision highp float;
  #endif
  varying highp vec2 vTexCoord;
  varying vec2 vFragPos;
  varying vec4 vInstanceColor;
  uniform sampler2D uSampler;
  uniform vec4 uColor;
  uniform float uOpacity;
  uniform float uTime;
`;

const MATERIAL_VERTEX_HEADER = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uModelViewMatrix;
  uniform float uTime;
  varying highp vec2 vTexCoord;
  varying vec2 vFragPos;
  varying vec4 vInstanceColor;
`;

/**
 * @class Material
 * @description A custom shader for a Drawable. By default it reuses the engine's
 * standard vertex shader (so transforms, the camera, and instancing keep
 * working) and only overrides the fragment program. Pass `options.vertex` to
 * also supply a custom VERTEX program — the escape hatch for effects the fixed
 * pipeline can't express (perspective tilt, vertex waves, billboarding, ...).
 *
 * The fragment shader always has: `vTexCoord`, `vFragPos`, `vInstanceColor`,
 * `uSampler`, `uColor`, `uOpacity`, `uTime`. A custom vertex shader gets
 * `aVertexPosition`, `aTextureCoord`, `uProjectionMatrix`, `uModelViewMatrix`,
 * `uTime`, and must write `vTexCoord` + `gl_Position`.
 *
 * Declare extra uniforms and set them via `set(name, value)`. A uniform value
 * may be a number, an array (vec2/3/4), or a FUNCTION — the function is called
 * each draw and receives the Drawable currently rendering, so a single shared
 * Material can read PER-OBJECT state (e.g. each card's own tilt angle).
 *
 * @example
 * // Per-object 3D tilt with one shared material:
 * const tilt = new Material(fragSrc, {
 *   vertex: tiltVertexSrc,
 *   uniforms: { uTiltX: (d) => d._tiltX || 0, uTiltY: (d) => d._tiltY || 0 },
 * });
 * cardA.setMaterial(tilt); cardB.setMaterial(tilt);
 * cardA.getComponent(Texture)._tiltX = 0.3; // each object animates independently
 */
class Material {
  /**
   * @param {string} fragmentSource - Fragment shader body (declares void main)
   * @param {Object} [options] - { vertex?: string, uniforms?: { name: value|function } }
   */
  constructor(fragmentSource, options = {}) {
    const gl = GLManager.getGL();
    this.gl = gl;

    const vertexSource = options.vertex
      ? MATERIAL_VERTEX_HEADER + options.vertex
      : STANDARD_VERTEX_SHADER;

    /** @private */
    this._vertexSource = vertexSource;
    /** @private */
    this._fragmentSource = MATERIAL_FRAGMENT_HEADER + fragmentSource;

    this.program = initShaderProgram(
      gl,
      this._vertexSource,
      this._fragmentSource
    );

    this.programInfo = {
      program: this.program,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(this.program, "aVertexPosition"),
        aTexCoord: gl.getAttribLocation(this.program, "aTextureCoord"),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(
          this.program,
          "uProjectionMatrix"
        ),
        globalViewMatrix: gl.getUniformLocation(
          this.program,
          "uModelViewMatrix"
        ),
        useInstances: gl.getUniformLocation(this.program, "useInstances"),
        uSampler: gl.getUniformLocation(this.program, "uSampler"),
        color: gl.getUniformLocation(this.program, "uColor"),
        uOpacity: gl.getUniformLocation(this.program, "uOpacity"),
        uTime: gl.getUniformLocation(this.program, "uTime"),
      },
    };

    this.uniforms = Object.assign({}, options.uniforms);
    /** @private */
    this._locCache = new Map();

    GLManager.registerRestorable(this);
  }

  /**
   * @method _restoreGL
   * @description Recompiles the material's program and refreshes every cached
   * location after a WebGL context loss.
   * @private
   */
  _restoreGL() {
    const gl = this.gl;
    if (!gl) return;
    this.program = initShaderProgram(
      gl,
      this._vertexSource,
      this._fragmentSource
    );
    this._locCache.clear();
    this.programInfo.program = this.program;
    const a = this.programInfo.attribLocations;
    a.vertexPosition = gl.getAttribLocation(this.program, "aVertexPosition");
    a.aTexCoord = gl.getAttribLocation(this.program, "aTextureCoord");
    const u = this.programInfo.uniformLocations;
    u.projectionMatrix = gl.getUniformLocation(
      this.program,
      "uProjectionMatrix"
    );
    u.globalViewMatrix = gl.getUniformLocation(
      this.program,
      "uModelViewMatrix"
    );
    u.useInstances = gl.getUniformLocation(this.program, "useInstances");
    u.uSampler = gl.getUniformLocation(this.program, "uSampler");
    u.color = gl.getUniformLocation(this.program, "uColor");
    u.uOpacity = gl.getUniformLocation(this.program, "uOpacity");
    u.uTime = gl.getUniformLocation(this.program, "uTime");
  }

  /**
   * @method set
   * @description Sets (or schedules) a custom uniform value. Numbers, arrays
   * (vec2/3/4), and functions returning those are supported. A function uniform
   * receives the Drawable currently being rendered.
   * @param {string} name - Uniform name
   * @param {number|number[]|Function} value
   * @returns {Material} - this
   */
  set(name, value) {
    this.uniforms[name] = value;
    return this;
  }

  /** @private */
  _loc(name) {
    if (!this._locCache.has(name)) {
      this._locCache.set(name, this.gl.getUniformLocation(this.program, name));
    }
    return this._locCache.get(name);
  }

  /**
   * @method applyCustomUniforms
   * @description Uploads all user-declared uniforms. Called by Drawable each draw
   * after the program is bound. Inferred by value shape. Function uniforms are
   * called with the rendering Drawable so shared materials can read per-object data.
   * @param {Drawable} [drawable] - The drawable currently rendering
   */
  applyCustomUniforms(drawable) {
    const gl = this.gl;
    for (const name in this.uniforms) {
      let value = this.uniforms[name];
      if (typeof value === "function") value = value(drawable);
      const loc = this._loc(name);
      if (loc == null) continue;
      if (typeof value === "number") {
        gl.uniform1f(loc, value);
      } else if (Array.isArray(value) || value instanceof Float32Array) {
        switch (value.length) {
          case 2:
            gl.uniform2fv(loc, value);
            break;
          case 3:
            gl.uniform3fv(loc, value);
            break;
          case 4:
            gl.uniform4fv(loc, value);
            break;
          default:
            gl.uniform1fv(loc, value);
        }
      }
    }
  }
}

export default Material;
