import TextureManager from "./managers/TextureManager.js";

/**
 * @class TextureAtlas
 * @description Loads a packed sprite atlas (image + frame rectangles) and applies
 * named frames to Drawables as normalized UV regions. Accepts TexturePacker
 * JSON (hash or array `frames`) or a plain `{ name: {x,y,w,h} }` map.
 *
 * @example
 * const atlas = await TextureAtlas.load("sheet.png", sheetJson, true);
 * const sprite = new Texture(atlas.texturePath, 0, 0, 1, 1, 0, false, true);
 * obj.addComponent(sprite);
 * atlas.applyTo(sprite, "player_idle_0");
 */
class TextureAtlas {
  constructor(texturePath, frames, width, height) {
    this.texturePath = texturePath;
    this.frames = frames;
    this.width = width;
    this.height = height;
  }

  /**
   * @method load
   * @description Loads the atlas image (caching its GL texture) and parses frames.
   * @param {string} texturePath
   * @param {Object} atlasJson - Atlas description
   * @param {boolean} [pixelart] - Filter mode for the cached texture
   * @returns {Promise<TextureAtlas>}
   */
  static async load(texturePath, atlasJson, pixelart = false) {
    const image = await TextureManager.loadImage(texturePath);
    await TextureManager.getTexture(texturePath, pixelart);
    const w = image.width;
    const h = image.height;
    return new TextureAtlas(texturePath, TextureAtlas._parse(atlasJson), w, h);
  }

  /** @private */
  static _parse(json) {
    const out = {};
    if (json && json.frames) {
      if (Array.isArray(json.frames)) {
        for (const f of json.frames) out[f.filename] = f.frame;
      } else {
        for (const name in json.frames) out[name] = json.frames[name].frame;
      }
    } else if (json) {
      for (const name in json) out[name] = json[name];
    }
    return out;
  }

  /**
   * @method getFrame
   * @description Returns the pixel rect { x, y, w, h } for a frame name.
   */
  getFrame(name) {
    return this.frames[name] || null;
  }

  /**
   * @method getRegion
   * @description Returns the normalized UV region for a frame name.
   * @returns {{left,top,right,bottom}|null}
   */
  getRegion(name) {
    const f = this.frames[name];
    if (!f) return null;
    return {
      left: f.x / this.width,
      top: f.y / this.height,
      right: (f.x + f.w) / this.width,
      bottom: (f.y + f.h) / this.height,
    };
  }

  /**
   * @method applyTo
   * @description Applies a frame's UV region to a Drawable.
   * @param {Drawable} drawable
   * @param {string} name - Frame name
   * @returns {TextureAtlas} - this
   */
  applyTo(drawable, name) {
    const r = this.getRegion(name);
    if (r) {
      drawable.setRegion(r.left, r.top, r.right, r.bottom);
    } else {
      console.warn(`[TextureAtlas] > Unknown frame "${name}"`);
    }
    return this;
  }
}

export default TextureAtlas;
