/**
 * @class Time
 * @description Global time state for the game. `deltaTime` is the (scaled)
 * seconds since the last frame, `elapsedTime` accumulates total scaled time, and
 * `timeScale` lets you slow down / speed up / pause the simulation.
 */
class Time {
  /**
   * @method getDeltaTime
   * @description Returns the (time-scaled) delta time in seconds
   * @returns {number} - The delta time
   */
  static getDeltaTime() {
    return Time.deltaTime;
  }

  /**
   * @method setDeltaTime
   * @description Sets the delta time. The stored value is multiplied by
   * `timeScale`, and `elapsedTime` is advanced by the scaled amount. Called by
   * `Emerald.drawScene`, but can be called manually for custom loops.
   * @param {number} deltaTime - The unscaled delta time in seconds
   */
  static setDeltaTime(deltaTime) {
    const scaled = deltaTime * Time.timeScale;
    Time.unscaledDeltaTime = deltaTime;
    Time.deltaTime = scaled;
    Time.elapsedTime += scaled;
  }

  /**
   * @method getUnscaledDeltaTime
   * @description Returns the raw delta time, ignoring timeScale
   * @returns {number} - The unscaled delta time
   */
  static getUnscaledDeltaTime() {
    return Time.unscaledDeltaTime;
  }

  /**
   * @method getElapsedTime
   * @description Returns the total accumulated (scaled) time in seconds
   * @returns {number} - The elapsed time
   */
  static getElapsedTime() {
    return Time.elapsedTime;
  }

  /**
   * @method setTimeScale
   * @description Sets the time scale (1 = normal, 0 = paused, 2 = double speed)
   * @param {number} scale - The time scale (clamped to >= 0)
   */
  static setTimeScale(scale) {
    Time.timeScale = Math.max(0, scale);
  }

  /**
   * @method getTimeScale
   * @description Returns the current time scale
   * @returns {number} - The time scale
   */
  static getTimeScale() {
    return Time.timeScale;
  }
}

Time.deltaTime = 0;
Time.unscaledDeltaTime = 0;
Time.elapsedTime = 0;
Time.timeScale = 1;

export default Time;
