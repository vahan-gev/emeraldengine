export default AssetManager;
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
declare class AssetManager {
    /** @private */
    private static _loadAudio;
    /** @private */
    private static _loadFont;
    /** @private */
    private _queue;
    assets: Map<any, any>;
    /** @private */
    private _paths;
    /** @private */
    private _progressHandlers;
    /** @private */
    private _loaded;
    /** @private */
    private _total;
    /**
     * @method image
     * @description Queues an image/texture. The GL texture is created lazily by
     * the renderer; `get(key)` returns the HTMLImageElement.
     */
    image(key: any, path: any, options?: {}): this;
    /**
     * @method audio
     * @description Queues an audio file (returns an HTMLAudioElement on get()).
     */
    audio(key: any, path: any): this;
    /**
     * @method json
     * @description Queues a JSON file (parsed on get()).
     */
    json(key: any, path: any): this;
    /**
     * @method text
     * @description Queues a plain-text file.
     */
    text(key: any, path: any): this;
    /**
     * @method font
     * @description Queues a web font. `key` is the font-family name you will use
     * in CSS/canvas; `path` is the font file URL.
     */
    font(key: any, path: any, descriptors?: {}): this;
    /**
     * @method onProgress
     * @description Registers a callback invoked as (loaded, total) after each
     * asset resolves.
     */
    onProgress(handler: any): this;
    /**
     * @method progress
     * @returns {number} - Fraction loaded in [0, 1] (1 when nothing is queued).
     */
    progress(): number;
    /**
     * @method load
     * @description Loads every queued asset, resolving when all are done. Failed
     * assets reject the returned promise unless `continueOnError` is true, in
     * which case they resolve to null and loading continues.
     * @param {Object} [options] - { continueOnError = false }
     * @returns {Promise<Map>} - The resolved assets map
     */
    load(options?: any): Promise<Map<any, any>>;
    /** @private */
    private _loadOne;
    /**
     * @method get
     * @description Returns a previously loaded asset by key.
     */
    get(key: any): any;
    /**
     * @method has
     * @returns {boolean} - Whether an asset has been loaded for the key.
     */
    has(key: any): boolean;
    /**
     * @method getTexture
     * @description Convenience: returns the cached GL texture for an image asset
     * that was queued with `image()`. Resolves once the upload completes.
     * @param {string} key - The image asset key
     * @returns {Promise<{texture: WebGLTexture, width: number, height: number}>}
     */
    getTexture(key: string): Promise<{
        texture: WebGLTexture;
        width: number;
        height: number;
    }>;
    /**
     * @method clear
     * @description Forgets all loaded assets (does not free GL textures; use
     * TextureManager.clear for that).
     */
    clear(): void;
}
