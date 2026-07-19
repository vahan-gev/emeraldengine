import Drawable from "./Drawable.js";
import GameObject from "./components/GameObject.js";
import GLManager from "./managers/GLManager.js";
import { initVertexBuffer } from "./GLUtils.js";
import { Vector2, Vector3 } from "./Physics.js";

/**
 * @class CanvasText
 * @description Renders dynamic text using a system font by drawing to an
 * offscreen 2D canvas and uploading it as a texture. Unlike BitmapText it needs
 * no font sheet and supports any installed font. It's a Drawable component;
 * `CanvasText.create()` returns a ready GameObject sized to the text.
 *
 * @example
 * const label = CanvasText.create("Score: 0", {
 *   font: "bold 28px monospace", color: "#6ee7b7", screenSpace: true,
 * });
 * label.transform.position = new Vector3(-300, 260, 100);
 * scene.add(label);
 * label.getComponent(CanvasText).setText("Score: 120");
 */
class CanvasText extends Drawable {
  constructor(text, options = {}) {
    const gl = GLManager.getGL();
    const vertices = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    const verticesBuffer = initVertexBuffer(gl, vertices);
    const texCoords = [1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0];
    const texCoordBuffer = initVertexBuffer(gl, texCoords);

    super(
      gl,
      GLManager.getProgramInfo(),
      verticesBuffer,
      texCoordBuffer,
      vertices,
      false,
      "",
      0,
      0,
      1,
      1,
      0,
      false,
      false,
      options.useLighting === true
    );

    this.font = options.font || "24px sans-serif";
    this.fillStyle = options.color || "#ffffff";
    this.padding = options.padding != null ? options.padding : 6;
    this.maxWidth = options.maxWidth || 0;
    this.align = options.align || "center";
    this.lineHeight = options.lineHeight || 0;
    /** @private */
    this._canvas = document.createElement("canvas");
    /** @private */
    this._ctx = this._canvas.getContext("2d");

    this.useTexture = true;
    this.texture = gl.createTexture();
    this.width = 1;
    this.height = 1;

    this.setText(text);
  }

  /**
   * @method setText
   * @description Re-renders the text and re-uploads the texture. If attached to
   * a GameObject, its scale is updated to match the new size.
   * @param {string} text
   */
  setText(text) {
    this.text = text;
    const ctx = this._ctx;
    const dpr =
      (typeof window !== "undefined" && window.devicePixelRatio) || 1;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = this.font;
    const fontSize = parseInt(this.font, 10) || 24;
    const lineHeight = this.lineHeight || Math.ceil(fontSize * 1.4);

    const lines = CanvasText.wrapText(
      (s) => ctx.measureText(s).width,
      String(text),
      this.maxWidth
    );

    let maxLineW = 1;
    for (const ln of lines) {
      const m = ctx.measureText(ln);
      let lw = m.width;
      if (m.actualBoundingBoxLeft != null && m.actualBoundingBoxRight != null) {
        lw = Math.max(lw, m.actualBoundingBoxLeft + m.actualBoundingBoxRight);
      }
      maxLineW = Math.max(maxLineW, lw);
    }
    const contentW = this.maxWidth ? Math.max(maxLineW, this.maxWidth) : maxLineW;
    const w = Math.max(1, Math.ceil(contentW) + this.padding * 2);
    const h = lines.length * lineHeight + this.padding * 2;

    this._canvas.width = Math.max(1, Math.round(w * dpr));
    this._canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.font = this.font;
    ctx.textBaseline = "middle";
    ctx.textAlign = this.align;
    ctx.fillStyle = this.fillStyle;

    const x =
      this.align === "left"
        ? this.padding
        : this.align === "right"
        ? w - this.padding
        : w / 2;
    for (let i = 0; i < lines.length; i++) {
      const y = this.padding + lineHeight * (i + 0.5);
      ctx.fillText(lines[i], x, y);
    }

    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this._canvas
    );

    this.textureWidth = this._canvas.width;
    this.textureHeight = this._canvas.height;
    this.originalTexture = this.texture;
    this.width = w;
    this.height = h;
    /** @private */
    this._lastTextureWidth = -1;

    if (this.parentObject && this.parentObject.transform) {
      this.parentObject.transform.scale.x = w / 2;
      this.parentObject.transform.scale.y = h / 2;
    }
  }

  /**
   * @method wrapText
   * @description Pure helper that breaks `text` into rendered lines. Honors
   * explicit `\n` line breaks and, when `maxWidth > 0`, greedily word-wraps each
   * paragraph so no line measures wider than `maxWidth`. A single word longer
   * than `maxWidth` is kept on its own line rather than being split.
   * @param {(s:string)=>number} measure - Returns the pixel width of a string
   * @param {string} text - The text to lay out
   * @param {number} maxWidth - Wrap width in pixels (0 disables wrapping)
   * @returns {string[]} - The lines to render top to bottom
   */
  static wrapText(measure, text, maxWidth) {
    const hardLines = text.split("\n");
    if (!maxWidth || maxWidth <= 0) return hardLines;
    const out = [];
    for (const hard of hardLines) {
      const words = hard.split(" ");
      let line = "";
      for (const word of words) {
        const test = line ? line + " " + word : word;
        if (line && measure(test) > maxWidth) {
          out.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      out.push(line);
    }
    return out;
  }

  /**
   * @method setMaxWidth
   * @description Sets the wrap width in pixels (0 disables wrapping) and
   * re-renders.
   * @param {number} px
   */
  setMaxWidth(px) {
    this.maxWidth = px || 0;
    this.setText(this.text);
  }

  /**
   * @method setAlign
   * @description Sets horizontal alignment ("left" | "center" | "right") and
   * re-renders.
   * @param {string} align
   */
  setAlign(align) {
    this.align = align;
    this.setText(this.text);
  }

  /**
   * @method setColor
   * @description Sets the text color (CSS color string) and re-renders.
   * @param {string} cssColor
   */
  setColor(cssColor) {
    this.fillStyle = cssColor;
    this.setText(this.text);
  }

  /**
   * @method getSize
   * @returns {{width:number, height:number}} - The canvas pixel size
   */
  getSize() {
    return { width: this.width, height: this.height };
  }

  /**
   * @method _restoreGL
   * @description After a context loss: rebuild the base buffers, recreate this
   * text's own texture, and re-render the current string into it.
   * @private
   */
  _restoreGL() {
    if (this._disposed) return;
    super._restoreGL();
    if (!this.gl) return;
    this._canvas = this._canvas || document.createElement("canvas");
    this._ctx = this._canvas.getContext("2d");
    this.texture = this.gl.createTexture();
    this.setText(this.text);
  }

  /**
   * @method dispose
   * @description Frees the GL texture this text owns (CanvasText renders into
   * its own texture, unlike path-loaded Textures which are shared) plus the
   * base Drawable buffers. Safe to call twice.
   */
  dispose() {
    if (this._disposed) return;
    if (this.gl && this.texture) this.gl.deleteTexture(this.texture);
    this.texture = null;
    this.originalTexture = null;
    this._canvas = null;
    this._ctx = null;
    super.dispose();
  }

  /**
   * @method create
   * @description Convenience factory returning a GameObject sized to the text.
   * @param {string} text
   * @param {Object} [options] - { name, position, screenSpace, font, color,
   *   maxWidth, align, lineHeight, padding }
   * @returns {GameObject}
   */
  static create(text, options = {}) {
    const component = new CanvasText(text, options);
    const go = new GameObject(
      options.name || `text:${text}`,
      options.position || new Vector3(0, 0, 0),
      0,
      new Vector2(component.width / 2, component.height / 2)
    );
    go.addComponent(component);
    if (options.screenSpace) go.setScreenSpace(true);
    return go;
  }
}

export default CanvasText;
