/**
 * @class Time
 * @description Represents the time
 * @param {number} deltaTime - The delta time
 */
class Time {
  /**
   * @method getDeltaTime
   * @description Returns the delta time
   * @returns {number} - The delta time
   */
  static getDeltaTime() {
    return Time.deltaTime;
  }

  /**
   * @method setDeltaTime
   * @description Sets the delta time
   * @param {number} deltaTime - The delta time
   */
  static setDeltaTime(deltaTime) {
    Time.deltaTime = deltaTime;
  }
}

Time.deltaTime = 0;

export default Time;
