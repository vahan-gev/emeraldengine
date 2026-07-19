import Tilemap from "../Tilemap.js";

const FLIP_FLAGS = 0xe0000000;
const GID_MASK = 0x1fffffff;

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
class TiledMap {
  /**
   * @method tilesetFor
   * @description Finds the tileset a (masked) global id belongs to.
   * @param {Object} map - Parsed Tiled map JSON
   * @param {number} gid - Masked global tile id (flip flags removed)
   * @returns {Object|null}
   */
  static tilesetFor(map, gid) {
    const sets = map.tilesets || [];
    let best = null;
    for (const ts of sets) {
      if (ts.firstgid <= gid && (!best || ts.firstgid > best.firstgid)) {
        best = ts;
      }
    }
    return best;
  }

  /** @private */
  static _tileLayer(map, layer) {
    const layers = (map.layers || []).filter((l) => l.type === "tilelayer");
    if (layer == null) return layers[0] || null;
    if (typeof layer === "number") return layers[layer] || null;
    return layers.find((l) => l.name === layer) || null;
  }

  /**
   * @method toFrameGrid
   * @description Converts a tile layer into a 2D array of local frame indices
   * (-1 for empty), ready for Tilemap.setMap. Global ids are converted to
   * tileset-local indices and flip flags are stripped.
   * @param {Object} map - Parsed Tiled map JSON
   * @param {Object} [options] - { layer } (name, index, or first tile layer)
   * @returns {number[][]}
   */
  static toFrameGrid(map, options = {}) {
    const layer = TiledMap._tileLayer(map, options.layer);
    if (!layer) return [];
    const cols = layer.width;
    const rows = layer.height;
    const data = layer.data || [];
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const raw = data[r * cols + c] || 0;
        if (raw === 0) {
          row.push(-1);
          continue;
        }
        const gid = (raw & GID_MASK) >>> 0;
        const ts = TiledMap.tilesetFor(map, gid);
        row.push(ts ? gid - ts.firstgid : gid - 1);
      }
      grid.push(row);
    }
    return grid;
  }

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
  static toTilemap(map, texturePath, options = {}) {
    const ts = (map.tilesets || [])[0] || {};
    const tilemap = new Tilemap(options.name || "tiledmap", texturePath, {
      tileSize: options.tileSize ?? map.tilewidth ?? ts.tilewidth ?? 16,
      frameWidth: ts.tilewidth ?? map.tilewidth ?? 16,
      frameHeight: ts.tileheight ?? map.tileheight ?? 16,
      framesPerRow: ts.columns ?? 1,
      totalFrames: ts.tilecount ?? 1,
      pixelart: options.pixelart ?? true,
    });
    const grid = TiledMap.toFrameGrid(map, options);
    tilemap.setMap(grid, {
      originX: options.originX ?? 0,
      originY: options.originY ?? 0,
      flipY: options.flipY ?? true,
    });
    return tilemap;
  }

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
  static objects(map, options = {}) {
    const groups = (map.layers || []).filter((l) => l.type === "objectgroup");
    let group;
    if (options.layer == null) group = groups[0];
    else if (typeof options.layer === "number") group = groups[options.layer];
    else group = groups.find((l) => l.name === options.layer);
    if (!group) return [];

    const flipY = options.flipY ?? false;
    const originX = options.originX ?? 0;
    const originY = options.originY ?? 0;
    const mapPixelH = (map.height || 0) * (map.tileheight || 0);

    return (group.objects || []).map((o) => {
      const props = {};
      if (Array.isArray(o.properties)) {
        for (const p of o.properties) props[p.name] = p.value;
      }
      const worldY = flipY ? mapPixelH - o.y : o.y;
      return {
        id: o.id,
        name: o.name || "",
        type: o.type || o.class || "",
        x: originX + o.x,
        y: originY + worldY,
        width: o.width || 0,
        height: o.height || 0,
        rotation: o.rotation || 0,
        gid: o.gid != null ? (o.gid & GID_MASK) >>> 0 : null,
        point: !!o.point,
        ellipse: !!o.ellipse,
        polygon: o.polygon || null,
        props,
      };
    });
  }
}

export { FLIP_FLAGS, GID_MASK };
export default TiledMap;
