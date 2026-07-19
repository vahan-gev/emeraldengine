import GLManager from "./GLManager.js";

/**
 * @class TextureManager
 * @description Caches loaded images and GL textures so that many drawables
 * sharing the same texture path download and upload the image only once.
 *
 * Textures are immutable after upload in this engine, so the same GL texture
 * object can safely be bound by any number of objects. The GL-texture cache is
 * keyed by path *and* filter mode, because pixel-art (NEAREST) and smooth
 * (LINEAR) sampling require separate texture objects.
 */
class TextureManager {
  /**
   * @method loadImage
   * @description Loads (and caches) an HTMLImageElement for a given path.
   * Concurrent requests for the same path share a single in-flight load.
   * @param {string} path - The path (or data URL) of the image
   * @returns {Promise<HTMLImageElement>} - The loaded image
   */
  static loadImage(path) {
    if (TextureManager.images.has(path)) {
      return TextureManager.images.get(path);
    }

    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", () => {
        TextureManager.images.delete(path);
        reject(
          new Error(
            `[TextureManager.js] > Failed to load image: ${path}. Check that the file exists and the path is correct.`
          )
        );
      });
      image.src = path;
    });

    TextureManager.images.set(path, promise);
    return promise;
  }

  /**
   * @method getTexture
   * @description Returns a cached GL texture for the given path, creating and
   * uploading it on first request. Subsequent calls reuse the same texture.
   * @param {string} path - The path (or data URL) of the texture
   * @param {boolean} pixelart - Whether to sample with NEAREST (pixel art) filtering
   * @returns {Promise<{texture: WebGLTexture, width: number, height: number}>}
   */
  static getTexture(path, pixelart = false) {
    const key = `${path}|${pixelart ? "nearest" : "linear"}`;
    if (TextureManager.textures.has(key)) {
      return TextureManager.textures.get(key);
    }

    const promise = TextureManager._upload(path, pixelart);
    TextureManager.textures.set(key, promise);
    return promise;
  }

  /**
   * @method _upload
   * @description Loads the image (via the shared image cache) and uploads it
   * as a GL texture with the requested filtering.
   * @private
   */
  static _upload(path, pixelart) {
    return TextureManager.loadImage(path).then((image) => {
      const gl = GLManager.getGL();
      if (!gl) {
        throw new Error(
          "[TextureManager] > No GL context set. Create an Emerald instance before loading textures."
        );
      }

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const filter = pixelart ? gl.NEAREST : gl.LINEAR;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );

      return { texture, width: image.width, height: image.height };
    });
  }

  /**
   * @method restoreAll
   * @description Re-uploads every cached texture after a WebGL context loss.
   * The image cache survives the loss, so this is upload-only (no network).
   * Reference counts are untouched — they track logical ownership by
   * drawables, which still exist.
   */
  static restoreAll() {
    for (const key of Array.from(TextureManager.textures.keys())) {
      const sep = key.lastIndexOf("|");
      const path = key.slice(0, sep);
      const pixelart = key.slice(sep + 1) === "nearest";
      TextureManager.textures.set(key, TextureManager._upload(path, pixelart));
    }
  }

  /**
   * @method preload
   * @description Eagerly loads a list of texture paths so they are ready (and
   * cached) before the first frame that needs them.
   * @param {string[]} paths - The texture paths to preload
   * @param {boolean} pixelart - Whether to use pixel-art filtering
   * @returns {Promise<void>}
   */
  static async preload(paths, pixelart = false) {
    await Promise.all(paths.map((path) => TextureManager.getTexture(path, pixelart)));
  }

  /**
   * @method has
   * @description Checks whether a GL texture is already cached for a path
   * @param {string} path - The texture path
   * @param {boolean} pixelart - Whether the pixel-art variant is meant
   * @returns {boolean}
   */
  static has(path, pixelart = false) {
    return TextureManager.textures.has(`${path}|${pixelart ? "nearest" : "linear"}`);
  }

  /**
   * @method retain
   * @description Increments the reference count for a cached texture. Every
   * Drawable that resolves a texture through getTexture() retains it; when the
   * last user releases it, the GL texture is freed. Call retain/release in
   * pairs (Drawable.dispose does the release for you).
   * @param {string} path - The texture path
   * @param {boolean} pixelart - Whether the pixel-art variant is meant
   */
  static retain(path, pixelart = false) {
    const key = `${path}|${pixelart ? "nearest" : "linear"}`;
    TextureManager.refs.set(key, (TextureManager.refs.get(key) || 0) + 1);
  }

  /**
   * @method release
   * @description Decrements a texture's reference count; when it reaches zero
   * the GL texture is deleted and dropped from the cache (the CPU-side image
   * cache is kept so a later reload is cheap).
   * @param {string} path - The texture path
   * @param {boolean} pixelart - Whether the pixel-art variant is meant
   */
  static release(path, pixelart = false) {
    const key = `${path}|${pixelart ? "nearest" : "linear"}`;
    const count = TextureManager.refs.get(key);
    if (count == null) return;
    if (count > 1) {
      TextureManager.refs.set(key, count - 1);
      return;
    }
    TextureManager.refs.delete(key);
    const promise = TextureManager.textures.get(key);
    TextureManager.textures.delete(key);
    const gl = GLManager.getGL();
    if (promise && gl) {
      promise.then(({ texture }) => gl.deleteTexture(texture)).catch(() => {});
    }
  }

  /**
   * @method refCount
   * @description Current reference count for a texture (0 if uncached).
   * @returns {number}
   */
  static refCount(path, pixelart = false) {
    return TextureManager.refs.get(`${path}|${pixelart ? "nearest" : "linear"}`) || 0;
  }

  /**
   * @method clear
   * @description Deletes all cached GL textures and clears the image cache.
   * Useful when tearing down a context or freeing memory between levels.
   */
  static clear() {
    const gl = GLManager.getGL();
    if (gl) {
      TextureManager.textures.forEach((promise) => {
        promise.then(({ texture }) => gl.deleteTexture(texture)).catch(() => {});
      });
    }
    TextureManager.textures.clear();
    TextureManager.images.clear();
    TextureManager.refs.clear();
  }
}

TextureManager.images = new Map();
TextureManager.textures = new Map();
TextureManager.refs = new Map();

export default TextureManager;
