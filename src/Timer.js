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
class Timer {
  /**
   * @method after
   * @description Runs a callback once after a delay.
   * @param {number} seconds - Delay in seconds
   * @param {Function} callback
   * @returns {Object} - A handle for clear()
   */
  static after(seconds, callback) {
    return Timer._add(seconds, callback, 1);
  }

  /**
   * @method every
   * @description Runs a callback repeatedly on an interval.
   * @param {number} seconds - Interval in seconds
   * @param {Function} callback
   * @param {number} [repeats] - Number of repeats (default Infinity)
   * @returns {Object} - A handle for clear()
   */
  static every(seconds, callback, repeats = Infinity) {
    return Timer._add(seconds, callback, repeats);
  }

  /** @private */
  static _add(interval, callback, repeats) {
    const entry = {
      interval: Math.max(0, interval),
      callback,
      repeats,
      elapsed: 0,
      cancelled: false,
    };
    Timer.entries.push(entry);
    return entry;
  }

  /**
   * @method clear
   * @description Cancels a scheduled timer by its handle.
   * @param {Object} handle - The handle returned by after/every
   */
  static clear(handle) {
    if (handle) handle.cancelled = true;
  }

  /**
   * @method clearAll
   * @description Cancels all timers.
   */
  static clearAll() {
    Timer.entries.length = 0;
  }

  /**
   * @method update
   * @description Advances all timers. Driven by Emerald.drawScene.
   * @param {number} dt - Seconds since the last frame
   */
  static update(dt) {
    const entries = Timer.entries;
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.cancelled) {
        entries.splice(i, 1);
        continue;
      }

      entry.elapsed += dt;
      while (!entry.cancelled && entry.elapsed >= entry.interval) {
        entry.elapsed -= entry.interval;
        entry.repeats -= 1;
        entry.callback();
        if (entry.repeats <= 0) {
          entry.cancelled = true;
        }
        if (entry.interval === 0) break;
      }

      if (entry.cancelled) entries.splice(i, 1);
    }
  }
}

Timer.entries = [];

export default Timer;
