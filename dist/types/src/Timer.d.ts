export default Timer;
/**
 * @class Timer
 * @description Schedules delayed and repeating callbacks measured in seconds.
 * Driven by `Emerald.drawScene` with time-scaled delta, so timers honor
 * pause/slow-mo. Each scheduler call returns a handle you can pass to `clear`.
 *
 * @example
 * Timer.after(2, () => spawnEnemy());        // once, after 2s
 * Timer.every(0.5, () => tick(), 10);        // 10 times, every 0.5s
 * const h = Timer.every(1, () => poll());    // forever until cleared
 * Timer.clear(h);
 */
declare class Timer {
    /**
     * @method after
     * @description Runs a callback once after a delay.
     * @param {number} seconds - Delay in seconds
     * @param {Function} callback
     * @returns {Object} - A handle for clear()
     */
    static after(seconds: number, callback: Function): any;
    /**
     * @method every
     * @description Runs a callback repeatedly on an interval.
     * @param {number} seconds - Interval in seconds
     * @param {Function} callback
     * @param {number} [repeats] - Number of repeats (default Infinity)
     * @returns {Object} - A handle for clear()
     */
    static every(seconds: number, callback: Function, repeats?: number): any;
    /** @private */
    private static _add;
    /**
     * @method clear
     * @description Cancels a scheduled timer by its handle.
     * @param {Object} handle - The handle returned by after/every
     */
    static clear(handle: any): void;
    /**
     * @method clearAll
     * @description Cancels all timers.
     */
    static clearAll(): void;
    /**
     * @method update
     * @description Advances all timers. Driven by Emerald.drawScene.
     * @param {number} dt - Seconds since the last frame
     */
    static update(dt: number): void;
}
declare namespace Timer {
    let entries: any[];
}
