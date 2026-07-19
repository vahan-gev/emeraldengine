export default TextureManager;
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
declare class TextureManager {
    /**
     * @method loadImage
     * @description Loads (and caches) an HTMLImageElement for a given path.
     * Concurrent requests for the same path share a single in-flight load.
     * @param {string} path - The path (or data URL) of the image
     * @returns {Promise<HTMLImageElement>} - The loaded image
     */
    static loadImage(path: string): Promise<HTMLImageElement>;
    /**
     * @method getTexture
     * @description Returns a cached GL texture for the given path, creating and
     * uploading it on first request. Subsequent calls reuse the same texture.
     * @param {string} path - The path (or data URL) of the texture
     * @param {boolean} pixelart - Whether to sample with NEAREST (pixel art) filtering
     * @returns {Promise<{texture: WebGLTexture, width: number, height: number}>}
     */
    static getTexture(path: string, pixelart?: boolean): Promise<{
        texture: WebGLTexture;
        width: number;
        height: number;
    }>;
    /**
     * @method _upload
     * @description Loads the image (via the shared image cache) and uploads it
     * as a GL texture with the requested filtering.
     * @private
     */
    private static _upload;
    /**
     * @method restoreAll
     * @description Re-uploads every cached texture after a WebGL context loss.
     * The image cache survives the loss, so this is upload-only (no network).
     * Reference counts are untouched — they track logical ownership by
     * drawables, which still exist.
     */
    static restoreAll(): void;
    /**
     * @method preload
     * @description Eagerly loads a list of texture paths so they are ready (and
     * cached) before the first frame that needs them.
     * @param {string[]} paths - The texture paths to preload
     * @param {boolean} pixelart - Whether to use pixel-art filtering
     * @returns {Promise<void>}
     */
    static preload(paths: string[], pixelart?: boolean): Promise<void>;
    /**
     * @method has
     * @description Checks whether a GL texture is already cached for a path
     * @param {string} path - The texture path
     * @param {boolean} pixelart - Whether the pixel-art variant is meant
     * @returns {boolean}
     */
    static has(path: string, pixelart?: boolean): boolean;
    /**
     * @method retain
     * @description Increments the reference count for a cached texture. Every
     * Drawable that resolves a texture through getTexture() retains it; when the
     * last user releases it, the GL texture is freed. Call retain/release in
     * pairs (Drawable.dispose does the release for you).
     * @param {string} path - The texture path
     * @param {boolean} pixelart - Whether the pixel-art variant is meant
     */
    static retain(path: string, pixelart?: boolean): void;
    /**
     * @method release
     * @description Decrements a texture's reference count; when it reaches zero
     * the GL texture is deleted and dropped from the cache (the CPU-side image
     * cache is kept so a later reload is cheap).
     * @param {string} path - The texture path
     * @param {boolean} pixelart - Whether the pixel-art variant is meant
     */
    static release(path: string, pixelart?: boolean): void;
    /**
     * @method refCount
     * @description Current reference count for a texture (0 if uncached).
     * @returns {number}
     */
    static refCount(path: any, pixelart?: boolean): number;
    /**
     * @method clear
     * @description Deletes all cached GL textures and clears the image cache.
     * Useful when tearing down a context or freeing memory between levels.
     */
    static clear(): void;
}
declare namespace TextureManager {
    let images: Map<any, any>;
    let textures: Map<any, any>;
    let refs: Map<any, any>;
}
