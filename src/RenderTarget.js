import GLManager from "./managers/GLManager.js";

/**
 * @class RenderTarget
 * @description An offscreen render surface: a framebuffer backed by a color
 * texture (and an optional depth buffer). Bind it to render the scene (or a
 * post-processing pass) into a texture instead of the screen. The resulting
 * `texture` can then be sampled by another pass or drawn to the canvas.
 *
 * Used by the post-processing pipeline, but also useful on its own for
 * minimaps, mirrors, render-to-texture effects, or picture-in-picture.
 *
 * @example
 * const rt = new RenderTarget(512, 512);
 * rt.bind();
 * // ...draw...
 * rt.unbind();
 * // rt.texture now holds the rendered image
 */
class RenderTarget {
  /**
   * @param {number} width - Width in pixels
   * @param {number} height - Height in pixels
   * @param {Object} [options] - { depth = false, pixelart = false }
   */
  constructor(width, height, options = {}) {
    this.gl = GLManager.getGL();
    this.width = Math.max(1, width | 0);
    this.height = Math.max(1, height | 0);
    this.depth = !!options.depth;
    this.pixelart = !!options.pixelart;

    const gl = this.gl;
    this.framebuffer = gl.createFramebuffer();
    this.texture = gl.createTexture();
    this.depthBuffer = this.depth ? gl.createRenderbuffer() : null;

    this._allocate();
  }

  /** @private */
  _allocate() {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.width,
      this.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    const filter = this.pixelart ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0
    );

    if (this.depth) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        this.width,
        this.height
      );
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        this.depthBuffer
      );
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /**
   * @method resize
   * @description Resizes the surface (reallocating storage) if dimensions change.
   */
  resize(width, height) {
    const w = Math.max(1, width | 0);
    const h = Math.max(1, height | 0);
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this._allocate();
  }

  /**
   * @method bind
   * @description Binds this framebuffer and sets the viewport to its full size.
   */
  bind() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.width, this.height);
  }

  /**
   * @method unbind
   * @description Restores the default framebuffer (the canvas).
   */
  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  /**
   * @method dispose
   * @description Frees all GL resources held by this target.
   */
  dispose() {
    const gl = this.gl;
    if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
    if (this.texture) gl.deleteTexture(this.texture);
    if (this.depthBuffer) gl.deleteRenderbuffer(this.depthBuffer);
    this.framebuffer = this.texture = this.depthBuffer = null;
  }
}

export default RenderTarget;
