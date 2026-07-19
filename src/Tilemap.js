import GameObject from "./components/GameObject.js";
import InstancedTexture from "./InstancedTexture.js";
import Instance from "./Instance.js";
import RigidBody from "./components/RigidBody.js";
import BoxCollider from "./components/BoxCollider.js";
import { Vector2, Vector3 } from "./Physics.js";

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
class Tilemap {
  /**
   * @param {string} name - Name for the underlying GameObject
   * @param {string} texturePath - Path to the tile sheet
   * @param {Object} [options] - tileSize, frameWidth, frameHeight, framesPerRow, totalFrames, pixelart
   */
  constructor(name, texturePath, options = {}) {
    const {
      tileSize = 32,
      frameWidth = tileSize,
      frameHeight = tileSize,
      framesPerRow = 1,
      totalFrames = 1,
      pixelart = true,
    } = options;

    this.name = name;
    this.tileSize = tileSize;
    /** @private */
    this._config = {
      texturePath,
      frameWidth,
      frameHeight,
      framesPerRow,
      totalFrames,
      pixelart,
    };

    this.gameObject = new GameObject(
      name,
      new Vector3(0, 0, 0),
      0,
      new Vector2(1, 1)
    );
    this.texture = null;

    /** @private */
    this._map = null;
    /** @private */
    this._layout = null;
    /** @private */
    this._colliders = [];
  }

  /**
   * @method setMap
   * @description Builds (or rebuilds) the tile instances from a 2D array.
   * @param {number[][]} map - Rows of frame indices (-1/null = empty)
   * @param {Object} [options] - { originX = 0, originY = 0, flipY = true }
   * @returns {Tilemap} - this
   */
  setMap(map, options = {}) {
    const { originX = 0, originY = 0, flipY = true } = options;
    const rows = map.length;
    const cols = map.reduce((max, row) => Math.max(max, row ? row.length : 0), 0);
    const count = Math.max(1, rows * cols);

    this._map = map;
    this._layout = { originX, originY, flipY, rows, cols };

    const existing = this.gameObject.getComponent(InstancedTexture);
    if (existing) this.gameObject.removeComponent(existing);

    this.texture = new InstancedTexture(
      this._config.texturePath,
      count,
      this._config.frameWidth,
      this._config.frameHeight,
      this._config.framesPerRow,
      this._config.totalFrames,
      0,
      false,
      this._config.pixelart
    );
    this.texture.clearInstances();

    const half = this.tileSize / 2;
    for (let r = 0; r < rows; r++) {
      const row = map[r];
      if (!row) continue;
      for (let c = 0; c < row.length; c++) {
        const frame = row[c];
        if (frame == null || frame < 0) continue;
        const rowIndex = flipY ? rows - 1 - r : r;
        const x = originX + c * this.tileSize + half;
        const y = originY + rowIndex * this.tileSize + half;
        this.texture.addInstance(
          new Instance(
            `${this.name}_${r}_${c}`,
            new Vector3(x, y, 0),
            new Vector2(half, half),
            0,
            frame
          )
        );
      }
    }

    this.texture.setStatic(true);
    this.gameObject.addComponent(this.texture);
    return this;
  }

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
  buildColliders(physics, options = {}) {
    if (!this._map || !this._layout) return this;
    const {
      isSolid = (frame) => frame != null && frame >= 0,
      friction = 0.2,
      restitution = 0,
      density = 0,
      ownerObject = this.gameObject,
    } = options;

    this.clearColliders();

    const { originX, originY, flipY, rows } = this._layout;
    const ts = this.tileSize;
    const half = ts / 2;
    const scale = physics.getScale();

    for (let r = 0; r < rows; r++) {
      const row = this._map[r];
      if (!row) continue;
      let c = 0;
      while (c < row.length) {
        if (!isSolid(row[c])) {
          c++;
          continue;
        }
        let runStart = c;
        while (c < row.length && isSolid(row[c])) c++;
        const runLen = c - runStart;

        const rowIndex = flipY ? rows - 1 - r : r;
        const runWidth = runLen * ts;
        const centerX = originX + runStart * ts + runWidth / 2;
        const centerY = originY + rowIndex * ts + half;

        const body = new RigidBody(
          physics,
          "static",
          new Vector2(centerX, centerY),
          true,
          ownerObject,
          new Vector2(0, 0)
        );
        new BoxCollider(
          body,
          new Vector2(runWidth / 2 / scale, half / scale),
          density,
          friction,
          restitution,
          false,
          ownerObject
        );
        this._colliders.push(body);
      }
    }
    return this;
  }

  /**
   * @method clearColliders
   * @description Destroys the physics bodies created by buildColliders.
   * @returns {Tilemap} - this
   */
  clearColliders() {
    for (const body of this._colliders) {
      if (body && typeof body.destroy === "function") body.destroy();
    }
    this._colliders = [];
    return this;
  }

  /**
   * @method setAutoTiledMap
   * @description Convenience: computes frame indices from a solidity grid using
   * bitmask auto-tiling, then builds the map. See Tilemap.computeAutoTile.
   * @param {Array<Array<boolean|number>>} solidGrid - Truthy = solid cell
   * @param {Object} [options] - Auto-tile options + setMap options
   * @returns {Tilemap} - this
   */
  setAutoTiledMap(solidGrid, options = {}) {
    const frames = Tilemap.computeAutoTile(solidGrid, options);
    return this.setMap(frames, options);
  }

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
  static computeAutoTile(grid, options = {}) {
    const { frames = null, base = 0, edgesSolid = true } = options;
    const rows = grid.length;
    const out = [];
    const solidAt = (r, c) => {
      if (r < 0 || c < 0 || r >= rows || !grid[r] || c >= grid[r].length) {
        return edgesSolid;
      }
      return !!grid[r][c];
    };

    for (let r = 0; r < rows; r++) {
      const row = grid[r] || [];
      const outRow = [];
      for (let c = 0; c < row.length; c++) {
        if (!row[c]) {
          outRow.push(-1);
          continue;
        }
        let mask = 0;
        if (solidAt(r - 1, c)) mask |= 1;
        if (solidAt(r, c + 1)) mask |= 2;
        if (solidAt(r + 1, c)) mask |= 4;
        if (solidAt(r, c - 1)) mask |= 8;
        const frame = frames ? frames[mask] : mask;
        outRow.push(base + (frame == null ? 0 : frame));
      }
      out.push(outRow);
    }
    return out;
  }
}

export default Tilemap;
