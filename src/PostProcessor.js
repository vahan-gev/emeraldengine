import { initShaderProgram } from "./GLUtils.js";
import GLManager from "./managers/GLManager.js";
import RenderStats from "./managers/RenderStats.js";
import RenderTarget from "./RenderTarget.js";

const FULLSCREEN_VERTEX_SHADER = `
  attribute vec2 aPos;
  varying vec2 vUV;
  void main() {
    vUV = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

const FRAGMENT_HEADER = `
  #ifdef GL_ES
  precision highp float;
  #endif
  varying vec2 vUV;
  uniform sampler2D uScene;
  uniform vec2 uResolution;
  uniform float uTime;
`;

/**
 * @class PostEffect
 * @description A single full-screen post-processing pass: a fragment shader that
 * samples the previous pass (`uScene`) and writes the next image. The shader
 * automatically has `vUV`, `uScene`, `uResolution`, and `uTime` available; add
 * your own uniforms and set them with the `setUniforms` callback.
 *
 * @example
 * const tint = new PostEffect("tint", `
 *   uniform vec3 uTint;
 *   void main() { gl_FragColor = texture2D(uScene, vUV) * vec4(uTint, 1.0); }
 * `, { setUniforms: (gl, loc) => gl.uniform3f(loc("uTint"), 1.0, 0.8, 0.8) });
 */
class PostEffect {
  /**
   * @param {string} name - A label (for debugging)
   * @param {string} fragmentSource - Fragment shader body (declares void main)
   * @param {Object} [options] - { setUniforms(gl, loc, ctx), enabled = true }
   */
  constructor(name, fragmentSource, options = {}) {
    this.name = name;
    this.fragmentSource = fragmentSource;
    this.setUniforms = options.setUniforms || null;
    this.enabled = options.enabled !== false;
    this.program = null;
    /** @private */
    this._locCache = new Map();
  }

  /** @private */
  _compile(gl) {
    if (this.program) return;
    this.program = initShaderProgram(
      gl,
      FULLSCREEN_VERTEX_SHADER,
      FRAGMENT_HEADER + this.fragmentSource
    );
  }

  /**
   * @method _restoreGL
   * @description Drops the dead program/locations after a context loss so the
   * next _compile builds fresh ones.
   * @private
   */
  _restoreGL() {
    this.program = null;
    this._locCache.clear();
  }

  loc(gl, name) {
    if (!this._locCache.has(name)) {
      this._locCache.set(name, gl.getUniformLocation(this.program, name));
    }
    return this._locCache.get(name);
  }

  /**
   * @method render
   * @description Renders this effect from ctx.input into ctx.output. Override for
   * multi-pass effects.
   * @param {Object} ctx - Provided by the PostProcessor
   */
  render(ctx) {
    ctx.blit(this, ctx.input, ctx.output);
  }
}

/**
 * @class PostProcessor
 * @description Drives a chain of full-screen {@link PostEffect}s. The scene is
 * rendered into a texture, then each effect is applied in sequence (ping-ponging
 * between two render targets), and the final result is drawn to the screen.
 *
 * Created and managed by Emerald when you call `emerald.enablePostProcessing()`;
 * you usually just add effects via `emerald.addPostEffect(PostEffects.bloom())`.
 */
class PostProcessor {
  constructor() {
    this.gl = GLManager.getGL();
    this.effects = [];
    this.enabled = true;

    const gl = this.gl;
    /** @private */
    this._quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    /** @private */
    this._rtA = new RenderTarget(2, 2);
    /** @private */
    this._rtB = new RenderTarget(2, 2);
    /** @private */
    this._temps = [];
    /** @private */
    this._width = 2;
    /** @private */
    this._height = 2;

    GLManager.registerRestorable(this);
  }

  /**
   * @method _restoreGL
   * @description Rebuilds the fullscreen quad, ping-pong render targets, and
   * every effect's program after a WebGL context loss.
   * @private
   */
  _restoreGL() {
    const gl = this.gl;
    if (!gl) return;
    this._quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    this._rtA = new RenderTarget(2, 2);
    this._rtB = new RenderTarget(2, 2);
    this._temps = [];
    this._width = 2;
    this._height = 2;
    for (const effect of this.effects) {
      effect._restoreGL();
      effect._compile(gl);
    }
  }

  /**
   * @method addEffect
   * @description Appends an effect to the chain.
   * @param {PostEffect} effect
   * @returns {PostProcessor} - this
   */
  addEffect(effect) {
    effect._compile(this.gl);
    this.effects.push(effect);
    return this;
  }

  /**
   * @method removeEffect
   * @description Removes an effect from the chain.
   */
  removeEffect(effect) {
    const i = this.effects.indexOf(effect);
    if (i !== -1) this.effects.splice(i, 1);
    return this;
  }

  /**
   * @method clear
   * @description Removes all effects.
   */
  clear() {
    this.effects.length = 0;
    return this;
  }

  /**
   * @method hasEffects
   * @returns {boolean} - Whether any enabled effects exist.
   */
  hasEffects() {
    return this.enabled && this.effects.some((e) => e.enabled);
  }

  /** @private */
  _acquireTemp(index) {
    while (this._temps.length <= index) {
      this._temps.push(new RenderTarget(this._width, this._height));
    }
    const t = this._temps[index];
    t.resize(this._width, this._height);
    return t;
  }

  /**
   * @method process
   * @description Applies the effect chain, drawing the final image to the canvas.
   * @param {WebGLTexture} sceneTexture - The rendered scene
   * @param {number} width - Canvas width in pixels
   * @param {number} height - Canvas height in pixels
   * @param {number} time - Seconds (for time-based effects)
   */
  process(sceneTexture, width, height, time) {
    const gl = this.gl;
    this._width = width;
    this._height = height;
    this._rtA.resize(width, height);
    this._rtB.resize(width, height);

    const active = this.effects.filter((e) => e.enabled);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.disable(gl.SCISSOR_TEST);

    const ctx = {
      gl,
      time,
      width,
      height,
      processor: this,
      input: sceneTexture,
      output: null,
      blit: (effect, input, output) => this._blit(effect, input, output, ctx),
      acquireTemp: (i) => this._acquireTemp(i),
    };

    let input = sceneTexture;
    for (let i = 0; i < active.length; i++) {
      const isLast = i === active.length - 1;
      const output = isLast ? null : i % 2 === 0 ? this._rtA : this._rtB;
      ctx.input = input;
      ctx.output = output;
      active[i].render(ctx);
      input = output ? output.texture : null;
    }
  }

  /**
   * @method _blit
   * @description Renders one effect program from `input` into `output` (null =
   * screen), setting the standard uniforms.
   * @private
   */
  _blit(effect, input, output, ctx) {
    const gl = this.gl;
    if (output) {
      output.bind();
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this._width, this._height);
    }

    gl.useProgram(effect.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input);
    RenderStats.textureBinds++;
    gl.uniform1i(effect.loc(gl, "uScene"), 0);

    const resLoc = effect.loc(gl, "uResolution");
    if (resLoc) gl.uniform2f(resLoc, this._width, this._height);
    const timeLoc = effect.loc(gl, "uTime");
    if (timeLoc) gl.uniform1f(timeLoc, ctx.time);

    if (effect.setUniforms) {
      effect.setUniforms(gl, (n) => effect.loc(gl, n), ctx);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this._quad);
    const posLoc = gl.getAttribLocation(effect.program, "aPos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    RenderStats.drawCalls++;
  }

  /**
   * @method dispose
   * @description Frees the render targets owned by this processor.
   */
  dispose() {
    this._rtA.dispose();
    this._rtB.dispose();
    for (const t of this._temps) t.dispose();
    this._temps.length = 0;
  }
}

export default PostProcessor;
export { PostEffect };
