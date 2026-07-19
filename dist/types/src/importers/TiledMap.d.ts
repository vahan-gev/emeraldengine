export default TiledMap;
export const FLIP_FLAGS: 3758096384;
export const GID_MASK: 536870911;
/**
 * @class TiledMap
 * @description Imports orthogonal maps exported from the Tiled editor
 * (https://www.mapeditor.org) in JSON format into the engine's Tilemap, plus
 * helpers to pull object layers (spawn points, triggers, etc.) out as plain
 * data. Pure parsing — pass it the already-parsed JSON object (load it with
 * AssetManager.json or fetch).
 *
 * @example
 * const map = TiledMap.toTilemap(mapJson, "tiles.png");
 * scene.add(map.gameObject);
 * map.buildColliders(physics);
 * const spawns = TiledMap.objects(mapJson, { layer: "spawns", flipY: true });
 */
declare class TiledMap {
    /**
     * @method tilesetFor
     * @description Finds the tileset a (masked) global id belongs to.
     * @param {Object} map - Parsed Tiled map JSON
     * @param {number} gid - Masked global tile id (flip flags removed)
     * @returns {Object|null}
     */
    static tilesetFor(map: any, gid: number): any | null;
    /** @private */
    private static _tileLayer;
    /**
     * @method toFrameGrid
     * @description Converts a tile layer into a 2D array of local frame indices
     * (-1 for empty), ready for Tilemap.setMap. Global ids are converted to
     * tileset-local indices and flip flags are stripped.
     * @param {Object} map - Parsed Tiled map JSON
     * @param {Object} [options] - { layer } (name, index, or first tile layer)
     * @returns {number[][]}
     */
    static toFrameGrid(map: any, options?: any): number[][];
    /**
     * @method toTilemap
     * @description Builds a ready-to-render Tilemap from a Tiled map. The tile
     * sheet config (frame size, columns, count) is read from the map's first
     * tileset; the render tile size comes from the map's tilewidth.
     * @param {Object} map - Parsed Tiled map JSON
     * @param {string} texturePath - Path to the tile sheet image
     * @param {Object} [options] - { layer, pixelart = true, name, originX, originY }
     * @returns {Tilemap}
     */
    static toTilemap(map: any, texturePath: string, options?: any): Tilemap;
    /**
     * @method objects
     * @description Extracts the objects from an object layer as plain data
     * (spawn points, triggers, regions). Tiled `properties` arrays are flattened
     * into a `props` object. With `flipY` set, y is converted from Tiled's
     * top-left pixel origin to a y-up world using the map's pixel height.
     * @param {Object} map - Parsed Tiled map JSON
     * @param {Object} [options] - { layer, flipY = false, originX = 0, originY = 0 }
     * @returns {Array<Object>}
     */
    static objects(map: any, options?: any): Array<any>;
}
import Tilemap from "../Tilemap.js";
