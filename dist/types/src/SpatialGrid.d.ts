export default SpatialGrid;
/**
 * @class SpatialGrid
 * @description A uniform spatial hash grid for fast 2D neighbor queries (picking,
 * proximity, broadphase). Rebuild it each frame (or as objects move) with
 * clear()/insert(), then query by radius or rectangle.
 *
 * @example
 * const grid = new SpatialGrid(64);
 * grid.clear();
 * for (const e of enemies) grid.insert(e, e.transform.position.x, e.transform.position.y);
 * const near = grid.queryRadius(player.x, player.y, 100);
 */
declare class SpatialGrid {
    /**
     * @param {number} cellSize - World units per cell
     */
    constructor(cellSize?: number);
    cellSize: number;
    cells: Map<any, any>;
    /** @private */
    private _key;
    /** @private */
    private _cell;
    /**
     * @method clear
     * @description Empties the grid.
     */
    clear(): void;
    /**
     * @method insert
     * @description Inserts an item at a world position.
     * @param {*} item - The item to store
     * @param {number} x - World x
     * @param {number} y - World y
     */
    insert(item: any, x: number, y: number): void;
    /**
     * @method queryRect
     * @description Returns items whose stored position lies within a rectangle.
     * @returns {Array} - Matching items
     */
    queryRect(minX: any, minY: any, maxX: any, maxY: any): any[];
    /**
     * @method queryRadius
     * @description Returns items within a radius of a point.
     * @returns {Array} - Matching items
     */
    queryRadius(x: any, y: any, radius: any): any[];
}
