export default Tilemap;
/**
 * @class Tilemap
 * @description Builds a grid of tiles from a 2D array of frame indices, rendered
 * as a single instanced draw call. Use -1 (or null) for empty cells. The tiles
 * live on `tilemap.gameObject`, which you add to the scene.
 *
 * @example
 * const map = new Tilemap("level", "tiles.png", {
 *   tileSize: 32, frameWidth: 16, frameHeight: 16, framesPerRow: 4, totalFrames: 16,
 * });
 * map.setMap([
 *   [0, 0, 0, 0],
 *   [1, -1, -1, 1],
 *   [2, 2, 2, 2],
 * ]);
 * scene.add(map.gameObject);
 */
declare class Tilemap {
    /**
     * @method computeAutoTile
     * @description Pure helper that converts a 2D solidity grid into a 2D frame
     * index grid using 4-bit edge bitmasking. For each solid cell the neighbor
     * mask is built as up|right|down|left (bits 1,2,4,8); empty cells become -1.
     * Provide `frames` (a length-16 lookup from mask -> frame index) to match your
     * tilesheet layout; otherwise the mask itself is used as the frame index, and
     * `base` is added to every solid frame.
     *
     * @param {Array<Array<boolean|number>>} grid - Truthy = solid
     * @param {Object} [options] - { frames, base = 0, edgesSolid = true }
     * @returns {number[][]} - Frame indices (-1 for empty)
     */
    static computeAutoTile(grid: Array<Array<boolean | number>>, options?: any): number[][];
    /**
     * @param {string} name - Name for the underlying GameObject
     * @param {string} texturePath - Path to the tile sheet
     * @param {Object} [options] - tileSize, frameWidth, frameHeight, framesPerRow, totalFrames, pixelart
     */
    constructor(name: string, texturePath: string, options?: any);
    name: string;
    tileSize: any;
    /** @private */
    private _config;
    gameObject: GameObject;
    texture: InstancedTexture;
    /** @private */
    private _map;
    /** @private */
    private _layout;
    /** @private */
    private _colliders;
    /**
     * @method setMap
     * @description Builds (or rebuilds) the tile instances from a 2D array.
     * @param {number[][]} map - Rows of frame indices (-1/null = empty)
     * @param {Object} [options] - { originX = 0, originY = 0, flipY = true }
     * @returns {Tilemap} - this
     */
    setMap(map: number[][], options?: any): Tilemap;
    /**
     * @method buildColliders
     * @description Generates static physics colliders from the current map. Solid
     * cells are merged greedily into horizontal runs, so a row of N tiles becomes
     * one box collider instead of N — far fewer bodies for the physics engine.
     * The bodies are tagged so collision callbacks resolve back to `ownerObject`
     * (defaults to the tilemap's GameObject). Call again after setMap to rebuild.
     *
     * @param {Physics} physics - The physics engine
     * @param {Object} [options] - { isSolid, friction = 0.2, restitution = 0,
     *   density = 0, ownerObject }
     * @returns {Tilemap} - this
     */
    buildColliders(physics: Physics, options?: any): Tilemap;
    /**
     * @method clearColliders
     * @description Destroys the physics bodies created by buildColliders.
     * @returns {Tilemap} - this
     */
    clearColliders(): Tilemap;
    /**
     * @method setAutoTiledMap
     * @description Convenience: computes frame indices from a solidity grid using
     * bitmask auto-tiling, then builds the map. See Tilemap.computeAutoTile.
     * @param {Array<Array<boolean|number>>} solidGrid - Truthy = solid cell
     * @param {Object} [options] - Auto-tile options + setMap options
     * @returns {Tilemap} - this
     */
    setAutoTiledMap(solidGrid: Array<Array<boolean | number>>, options?: any): Tilemap;
}
import GameObject from "./components/GameObject.js";
import InstancedTexture from "./InstancedTexture.js";
