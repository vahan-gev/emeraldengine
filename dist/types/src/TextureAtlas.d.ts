export default TextureAtlas;
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
declare class TextureAtlas {
    /**
     * @method load
     * @description Loads the atlas image (caching its GL texture) and parses frames.
     * @param {string} texturePath
     * @param {Object} atlasJson - Atlas description
     * @param {boolean} [pixelart] - Filter mode for the cached texture
     * @returns {Promise<TextureAtlas>}
     */
    static load(texturePath: string, atlasJson: any, pixelart?: boolean): Promise<TextureAtlas>;
    /** @private */
    private static _parse;
    constructor(texturePath: any, frames: any, width: any, height: any);
    texturePath: any;
    frames: any;
    width: any;
    height: any;
    /**
     * @method getFrame
     * @description Returns the pixel rect { x, y, w, h } for a frame name.
     */
    getFrame(name: any): any;
    /**
     * @method getRegion
     * @description Returns the normalized UV region for a frame name.
     * @returns {{left,top,right,bottom}|null}
     */
    getRegion(name: any): {
        left: any;
        top: any;
        right: any;
        bottom: any;
    } | null;
    /**
     * @method applyTo
     * @description Applies a frame's UV region to a Drawable.
     * @param {Drawable} drawable
     * @param {string} name - Frame name
     * @returns {TextureAtlas} - this
     */
    applyTo(drawable: Drawable, name: string): TextureAtlas;
}
