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
class SpatialGrid {
  /**
   * @param {number} cellSize - World units per cell
   */
  constructor(cellSize = 64) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  /** @private */
  _key(cx, cy) {
    return cx + "," + cy;
  }

  /** @private */
  _cell(x, y) {
    return [Math.floor(x / this.cellSize), Math.floor(y / this.cellSize)];
  }

  /**
   * @method clear
   * @description Empties the grid.
   */
  clear() {
    this.cells.clear();
  }

  /**
   * @method insert
   * @description Inserts an item at a world position.
   * @param {*} item - The item to store
   * @param {number} x - World x
   * @param {number} y - World y
   */
  insert(item, x, y) {
    const [cx, cy] = this._cell(x, y);
    const key = this._key(cx, cy);
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = [];
      this.cells.set(key, bucket);
    }
    bucket.push({ item, x, y });
  }

  /**
   * @method queryRect
   * @description Returns items whose stored position lies within a rectangle.
   * @returns {Array} - Matching items
   */
  queryRect(minX, minY, maxX, maxY) {
    const [cx0, cy0] = this._cell(minX, minY);
    const [cx1, cy1] = this._cell(maxX, maxY);
    const results = [];
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) {
        const bucket = this.cells.get(this._key(cx, cy));
        if (!bucket) continue;
        for (const entry of bucket) {
          if (
            entry.x >= minX &&
            entry.x <= maxX &&
            entry.y >= minY &&
            entry.y <= maxY
          ) {
            results.push(entry.item);
          }
        }
      }
    }
    return results;
  }

  /**
   * @method queryRadius
   * @description Returns items within a radius of a point.
   * @returns {Array} - Matching items
   */
  queryRadius(x, y, radius) {
    const r2 = radius * radius;
    const results = [];
    const [cx0, cy0] = this._cell(x - radius, y - radius);
    const [cx1, cy1] = this._cell(x + radius, y + radius);
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) {
        const bucket = this.cells.get(this._key(cx, cy));
        if (!bucket) continue;
        for (const entry of bucket) {
          const dx = entry.x - x;
          const dy = entry.y - y;
          if (dx * dx + dy * dy <= r2) results.push(entry.item);
        }
      }
    }
    return results;
  }
}

export default SpatialGrid;
