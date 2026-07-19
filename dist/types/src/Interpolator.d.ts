export default Interpolator;
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
declare class Interpolator {
    /**
     * @param {Object} [options] - { delay = 0.1, maxBuffer = 60 }
     */
    constructor(options?: any);
    delay: any;
    maxBuffer: any;
    /** @private */
    private _buffers;
    /**
     * @method push
     * @description Records a snapshot for an entity at a given timestamp.
     * @param {string|number} id - Entity id
     * @param {Object} state - Any object with numeric fields to interpolate (e.g. {x,y})
     * @param {number} time - Snapshot timestamp in seconds
     */
    push(id: string | number, state: any, time: number): void;
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
    sample(id: string | number, now: number): any | null;
    /**
     * @method remove
     * @description Drops an entity's buffer (e.g. when it leaves).
     */
    remove(id: any): void;
    /**
     * @method prune
     * @description Drops snapshots older than (now - delay - keep) to bound memory
     * for long-lived entities.
     * @param {number} now - Current time in seconds
     * @param {number} [keep] - Extra history to retain past the render point
     */
    prune(now: number, keep?: number): void;
    /**
     * @method clear
     * @description Removes all buffered snapshots.
     */
    clear(): void;
}
