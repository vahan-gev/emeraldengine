import TextureManager from "./TextureManager.js";

/**
 * @class AssetManager
 * @description A general async loader for everything a game needs at startup:
 * images/textures, audio, JSON, text, and web fonts. It deduplicates by key,
 * reports aggregate progress (so you can drive a loading bar), and stores the
 * resolved assets for synchronous lookup afterwards via `get(key)`.
 *
 * Textures are routed through TextureManager so the GL upload cache is shared
 * with the rest of the engine.
 *
 * @example
 * const assets = new AssetManager();
 * assets.image("player", "player.png", { pixelart: true });
 * assets.audio("jump", "jump.wav");
 * assets.json("level1", "levels/1.json");
 * assets.font("Press Start 2P", "fonts/press-start.woff2");
 * assets.onProgress((loaded, total) => bar.set(loaded / total));
 * await assets.load();
 * const img = assets.get("player");      // HTMLImageElement
 * const data = assets.get("level1");     // parsed JSON
 */
class AssetManager {
  constructor() {
    /** @private */
    this._queue = new Map();
    this.assets = new Map();
    /** @private */
    this._paths = new Map();
    /** @private */
    this._progressHandlers = [];
    /** @private */
    this._loaded = 0;
    /** @private */
    this._total = 0;
  }

  /**
   * @method image
   * @description Queues an image/texture. The GL texture is created lazily by
   * the renderer; `get(key)` returns the HTMLImageElement.
   */
  image(key, path, options = {}) {
    this._queue.set(key, { type: "image", path, pixelart: !!options.pixelart });
    return this;
  }

  /**
   * @method audio
   * @description Queues an audio file (returns an HTMLAudioElement on get()).
   */
  audio(key, path) {
    this._queue.set(key, { type: "audio", path });
    return this;
  }

  /**
   * @method json
   * @description Queues a JSON file (parsed on get()).
   */
  json(key, path) {
    this._queue.set(key, { type: "json", path });
    return this;
  }

  /**
   * @method text
   * @description Queues a plain-text file.
   */
  text(key, path) {
    this._queue.set(key, { type: "text", path });
    return this;
  }

  /**
   * @method font
   * @description Queues a web font. `key` is the font-family name you will use
   * in CSS/canvas; `path` is the font file URL.
   */
  font(key, path, descriptors = {}) {
    this._queue.set(key, { type: "font", family: key, path, descriptors });
    return this;
  }

  /**
   * @method onProgress
   * @description Registers a callback invoked as (loaded, total) after each
   * asset resolves.
   */
  onProgress(handler) {
    if (typeof handler === "function") this._progressHandlers.push(handler);
    return this;
  }

  /**
   * @method progress
   * @returns {number} - Fraction loaded in [0, 1] (1 when nothing is queued).
   */
  progress() {
    return this._total === 0 ? 1 : this._loaded / this._total;
  }

  /**
   * @method load
   * @description Loads every queued asset, resolving when all are done. Failed
   * assets reject the returned promise unless `continueOnError` is true, in
   * which case they resolve to null and loading continues.
   * @param {Object} [options] - { continueOnError = false }
   * @returns {Promise<Map>} - The resolved assets map
   */
  async load(options = {}) {
    const { continueOnError = false } = options;
    const entries = Array.from(this._queue.entries());
    this._total = entries.length;
    this._loaded = 0;

    await Promise.all(
      entries.map(async ([key, spec]) => {
        try {
          const asset = await this._loadOne(spec);
          this.assets.set(key, asset);
          if (spec.type === "image") {
            this._paths.set(key, { path: spec.path, pixelart: spec.pixelart });
          }
        } catch (err) {
          if (!continueOnError) throw err;
          console.warn(`[AssetManager] Failed to load "${key}":`, err);
          this.assets.set(key, null);
        } finally {
          this._loaded++;
          for (const handler of this._progressHandlers) {
            handler(this._loaded, this._total);
          }
        }
      })
    );

    this._queue.clear();
    return this.assets;
  }

  /** @private */
  _loadOne(spec) {
    switch (spec.type) {
      case "image":
        return TextureManager.loadImage(spec.path);
      case "audio":
        return AssetManager._loadAudio(spec.path);
      case "json":
        return fetch(spec.path).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status} for ${spec.path}`);
          return r.json();
        });
      case "text":
        return fetch(spec.path).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status} for ${spec.path}`);
          return r.text();
        });
      case "font":
        return AssetManager._loadFont(spec);
      default:
        return Promise.reject(new Error(`Unknown asset type: ${spec.type}`));
    }
  }

  /** @private */
  static _loadAudio(path) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener("canplaythrough", () => resolve(audio), {
        once: true,
      });
      audio.addEventListener("error", () =>
        reject(new Error(`Failed to load audio: ${path}`))
      );
      audio.src = path;
      audio.load();
    });
  }

  /** @private */
  static async _loadFont(spec) {
    if (typeof FontFace === "undefined" || !document.fonts) {
      return null;
    }
    const face = new FontFace(spec.family, `url(${spec.path})`, spec.descriptors);
    const loaded = await face.load();
    document.fonts.add(loaded);
    return loaded;
  }

  /**
   * @method get
   * @description Returns a previously loaded asset by key.
   */
  get(key) {
    return this.assets.get(key);
  }

  /**
   * @method has
   * @returns {boolean} - Whether an asset has been loaded for the key.
   */
  has(key) {
    return this.assets.has(key);
  }

  /**
   * @method getTexture
   * @description Convenience: returns the cached GL texture for an image asset
   * that was queued with `image()`. Resolves once the upload completes.
   * @param {string} key - The image asset key
   * @returns {Promise<{texture: WebGLTexture, width: number, height: number}>}
   */
  getTexture(key) {
    const info = this._paths.get(key);
    if (!info) return Promise.reject(new Error(`No image asset "${key}"`));
    return TextureManager.getTexture(info.path, info.pixelart);
  }

  /**
   * @method clear
   * @description Forgets all loaded assets (does not free GL textures; use
   * TextureManager.clear for that).
   */
  clear() {
    this.assets.clear();
    this._queue.clear();
    this._loaded = 0;
    this._total = 0;
  }
}

export default AssetManager;
