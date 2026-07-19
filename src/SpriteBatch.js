import { initShaderProgram } from "./GLUtils.js";
import GLManager from "./managers/GLManager.js";
import RenderStats from "./managers/RenderStats.js";

const BATCH_VERTEX_SHADER = `
  attribute vec2 aPos;
  attribute vec2 aUV;
  attribute vec4 aColor;
  uniform mat4 uProjection;
  uniform mat4 uView;
  varying vec2 vUV;
  varying vec4 vColor;
  void main() {
    gl_Position = uProjection * uView * vec4(aPos, 0.0, 1.0);
    vUV = aUV;
    vColor = aColor;
  }
`;

const BATCH_FRAGMENT_SHADER = `
  #ifdef GL_ES
  precision highp float;
  #endif
  uniform sampler2D uSampler;
  varying vec2 vUV;
  varying vec4 vColor;
  void main() {
    vec4 tex = texture2D(uSampler, vUV);
    if (tex.a < 0.01) discard;
    gl_FragColor = tex * vColor;
  }
`;

const FLOATS_PER_VERTEX = 8;
const VERTS_PER_QUAD = 4;
const INDICES_PER_QUAD = 6;

/**
 * @class SpriteBatch
 * @description A dynamic batched sprite renderer. Instead of one draw call per
 * sprite (as ordinary Drawables incur), it accumulates many sprites that share a
 * texture into a single interleaved buffer and submits them in one
 * `drawElements` call. Batches are flushed automatically when the texture
 * changes or the buffer fills, so for content that shares a texture/atlas this
 * collapses hundreds of draw calls into a handful.
 *
 * It uses its own minimal shader program (position + uv + per-vertex color), so
 * it is independent of the main render pipeline.
 *
 * @example
 * const batch = new SpriteBatch();
 * batch.begin(projectionMatrix, viewMatrix); // gl-matrix mat4s
 * for (const e of entities) {
 *   batch.draw({ texture: atlasTex, x: e.x, y: e.y, w: 32, h: 32,
 *                u0: e.u0, v0: e.v0, u1: e.u1, v1: e.v1 });
 * }
 * batch.end();
 */
class SpriteBatch {
  /**
   * @param {Object} [options] - { maxQuads = 2000 }
   */
  constructor(options = {}) {
    this.gl = GLManager.getGL();
    this.maxQuads = options.maxQuads ?? 2000;

    const gl = this.gl;
    this.program = initShaderProgram(
      gl,
      BATCH_VERTEX_SHADER,
      BATCH_FRAGMENT_SHADER
    );
    this.attribs = {
      pos: gl.getAttribLocation(this.program, "aPos"),
      uv: gl.getAttribLocation(this.program, "aUV"),
      color: gl.getAttribLocation(this.program, "aColor"),
    };
    this.uniforms = {
      projection: gl.getUniformLocation(this.program, "uProjection"),
      view: gl.getUniformLocation(this.program, "uView"),
      sampler: gl.getUniformLocation(this.program, "uSampler"),
    };

    this.vertexData = new Float32Array(
      this.maxQuads * VERTS_PER_QUAD * FLOATS_PER_VERTEX
    );
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW);

    const indices = new Uint16Array(this.maxQuads * INDICES_PER_QUAD);
    for (let q = 0; q < this.maxQuads; q++) {
      const v = q * VERTS_PER_QUAD;
      const i = q * INDICES_PER_QUAD;
      indices[i] = v;
      indices[i + 1] = v + 1;
      indices[i + 2] = v + 2;
      indices[i + 3] = v;
      indices[i + 4] = v + 2;
      indices[i + 5] = v + 3;
    }
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    /** @private */
    this._quadCount = 0;
    /** @private */
    this._currentTexture = null;
    /** @private */
    this._projection = null;
    /** @private */
    this._view = null;
    this.drawCalls = 0;
  }

  /**
   * @method begin
   * @description Starts a batch with the given projection and view matrices
   * (gl-matrix mat4 / Float32Array(16)).
   */
  begin(projectionMatrix, viewMatrix) {
    this._projection = projectionMatrix;
    this._view = viewMatrix;
    this._quadCount = 0;
    this._currentTexture = null;
    this.drawCalls = 0;
  }

  /**
   * @method draw
   * @description Queues one sprite. Flushes first if the texture changed or the
   * batch is full.
   * @param {Object} sprite - {
   *   texture, x, y, w, h,
   *   rotation = 0, originX = 0.5, originY = 0.5,
   *   u0 = 0, v0 = 0, u1 = 1, v1 = 1,
   *   r = 1, g = 1, b = 1, a = 1
   * }
   */
  draw(sprite) {
    const tex = sprite.texture;
    if (
      (this._currentTexture && tex !== this._currentTexture) ||
      this._quadCount >= this.maxQuads
    ) {
      this.flush();
    }
    this._currentTexture = tex;

    const {
      x,
      y,
      w,
      h,
      rotation = 0,
      originX = 0.5,
      originY = 0.5,
      u0 = 0,
      v0 = 0,
      u1 = 1,
      v1 = 1,
      r = 1,
      g = 1,
      b = 1,
      a = 1,
    } = sprite;

    const cx = x + (0.5 - originX) * w;
    const cy = y + (0.5 - originY) * h;
    const offset = this._quadCount * VERTS_PER_QUAD * FLOATS_PER_VERTEX;
    SpriteBatch._writeQuad(
      this.vertexData,
      offset,
      cx,
      cy,
      w / 2,
      h / 2,
      rotation,
      u0,
      v0,
      u1,
      v1,
      r,
      g,
      b,
      a
    );
    this._quadCount++;
  }

  /**
   * @method end
   * @description Flushes any remaining sprites.
   */
  end() {
    this.flush();
  }

  /**
   * @method flush
   * @description Uploads and draws the currently staged quads.
   */
  flush() {
    if (this._quadCount === 0 || !this._currentTexture) return;
    const gl = this.gl;

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uniforms.projection, false, this._projection);
    gl.uniformMatrix4fv(this.uniforms.view, false, this._view);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._currentTexture);
    gl.uniform1i(this.uniforms.sampler, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    const used = this._quadCount * VERTS_PER_QUAD * FLOATS_PER_VERTEX;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexData.subarray(0, used));

    const stride = FLOATS_PER_VERTEX * 4;
    gl.enableVertexAttribArray(this.attribs.pos);
    gl.vertexAttribPointer(this.attribs.pos, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(this.attribs.uv);
    gl.vertexAttribPointer(this.attribs.uv, 2, gl.FLOAT, false, stride, 2 * 4);
    gl.enableVertexAttribArray(this.attribs.color);
    gl.vertexAttribPointer(this.attribs.color, 4, gl.FLOAT, false, stride, 4 * 4);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(
      gl.TRIANGLES,
      this._quadCount * INDICES_PER_QUAD,
      gl.UNSIGNED_SHORT,
      0
    );

    this.drawCalls++;
    RenderStats.drawCalls++;
    RenderStats.quads += this._quadCount;
    RenderStats.textureBinds++;
    this._quadCount = 0;
  }

  /**
   * @method _writeQuad
   * @description Pure helper that writes one quad's 4 interleaved vertices
   * (position, uv, color) into `out` at `offset`. Positions are rotated around
   * the quad center (cx, cy). Exposed (and side-effect free) for testing.
   * @private
   */
  static _writeQuad(out, offset, cx, cy, hw, hh, rot, u0, v0, u1, v1, r, g, b, a) {
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const corners = [
      [-hw, hh, u0, v0],
      [hw, hh, u1, v0],
      [hw, -hh, u1, v1],
      [-hw, -hh, u0, v1],
    ];
    let o = offset;
    for (let i = 0; i < 4; i++) {
      const lx = corners[i][0];
      const ly = corners[i][1];
      out[o++] = cx + lx * cos - ly * sin;
      out[o++] = cy + lx * sin + ly * cos;
      out[o++] = corners[i][2];
      out[o++] = corners[i][3];
      out[o++] = r;
      out[o++] = g;
      out[o++] = b;
      out[o++] = a;
    }
    return o;
  }
}

export default SpriteBatch;
