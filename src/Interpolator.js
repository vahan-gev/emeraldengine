/**
 * @class Interpolator
 * @description Snapshot interpolation buffer for smoothing networked state.
 * Authoritative updates arrive at a low, irregular rate (e.g. 10–20 Hz); this
 * buffers timestamped snapshots and lets you sample a position "in the past" by
 * a fixed render delay, so remote entities move smoothly between updates instead
 * of teleporting.
 *
 * It is transport-agnostic and pure (no network/DOM dependency), so it works
 * with the built-in NetworkManager, any other transport, or in tests.
 *
 * @example
 * const interp = new Interpolator({ delay: 0.1 });
 * // on each server update for an entity:
 * interp.push(entityId, { x, y }, serverTimeSeconds);
 * // each frame:
 * const pos = interp.sample(entityId, nowSeconds); // { x, y } or null
 */
class Interpolator {
  /**
   * @param {Object} [options] - { delay = 0.1, maxBuffer = 60 }
   */
  constructor(options = {}) {
    this.delay = options.delay ?? 0.1;
    this.maxBuffer = options.maxBuffer ?? 60;
    /** @private */
    this._buffers = new Map();
  }

  /**
   * @method push
   * @description Records a snapshot for an entity at a given timestamp.
   * @param {string|number} id - Entity id
   * @param {Object} state - Any object with numeric fields to interpolate (e.g. {x,y})
   * @param {number} time - Snapshot timestamp in seconds
   */
  push(id, state, time) {
    let buf = this._buffers.get(id);
    if (!buf) {
      buf = [];
      this._buffers.set(id, buf);
    }
    buf.push({ t: time, state });
    if (buf.length > 1 && buf[buf.length - 2].t > time) {
      buf.sort((a, b) => a.t - b.t);
    }
    if (buf.length > this.maxBuffer) buf.shift();
  }

  /**
   * @method sample
   * @description Returns the interpolated state for an entity at (now - delay).
   * Linearly interpolates numeric fields between the two surrounding snapshots.
   * Returns the latest snapshot if rendering ahead of the buffer, or null if no
   * data exists.
   * @param {string|number} id - Entity id
   * @param {number} now - Current time in seconds
   * @returns {Object|null} - Interpolated state, or null
   */
  sample(id, now) {
    const buf = this._buffers.get(id);
    if (!buf || buf.length === 0) return null;
    const renderTime = now - this.delay;

    if (renderTime <= buf[0].t) return { ...buf[0].state };
    const last = buf[buf.length - 1];
    if (renderTime >= last.t) return { ...last.state };

    let a = buf[0];
    let b = buf[buf.length - 1];
    for (let i = 0; i < buf.length - 1; i++) {
      if (buf[i].t <= renderTime && buf[i + 1].t >= renderTime) {
        a = buf[i];
        b = buf[i + 1];
        break;
      }
    }

    const span = b.t - a.t;
    const k = span <= 0 ? 0 : (renderTime - a.t) / span;
    const out = {};
    for (const key in a.state) {
      const av = a.state[key];
      const bv = b.state[key];
      out[key] =
        typeof av === "number" && typeof bv === "number"
          ? av + (bv - av) * k
          : bv;
    }
    return out;
  }

  /**
   * @method remove
   * @description Drops an entity's buffer (e.g. when it leaves).
   */
  remove(id) {
    this._buffers.delete(id);
  }

  /**
   * @method prune
   * @description Drops snapshots older than (now - delay - keep) to bound memory
   * for long-lived entities.
   * @param {number} now - Current time in seconds
   * @param {number} [keep] - Extra history to retain past the render point
   */
  prune(now, keep = 1) {
    const cutoff = now - this.delay - keep;
    for (const buf of this._buffers.values()) {
      while (buf.length > 2 && buf[0].t < cutoff) buf.shift();
    }
  }

  /**
   * @method clear
   * @description Removes all buffered snapshots.
   */
  clear() {
    this._buffers.clear();
  }
}

export default Interpolator;
