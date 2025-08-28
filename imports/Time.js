/**
 * @class Time
 * @description Represents the time
 * @param {number} deltaTime - The delta time
 */
class Time {
  static deltaTime = 0;

  /**
   * @method getDeltaTime
   * @description Returns the delta time
   * @returns {number} - The delta time
   */
  static getDeltaTime() {
    return this.deltaTime;
  }

  /**
   * @method setDeltaTime
   * @description Sets the delta time
   * @param {number} deltaTime - The delta time
   */
  static setDeltaTime(deltaTime) {
    this.deltaTime = deltaTime;
  }
}

export default Time;
