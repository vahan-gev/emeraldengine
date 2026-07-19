export default Time;
/**
 * @class Time
 * @description Global time state for the game. `deltaTime` is the (scaled)
 * seconds since the last frame, `elapsedTime` accumulates total scaled time, and
 * `timeScale` lets you slow down / speed up / pause the simulation.
 */
declare class Time {
    /**
     * @method getDeltaTime
     * @description Returns the (time-scaled) delta time in seconds
     * @returns {number} - The delta time
     */
    static getDeltaTime(): number;
    /**
     * @method setDeltaTime
     * @description Sets the delta time. The stored value is multiplied by
     * `timeScale`, and `elapsedTime` is advanced by the scaled amount. Called by
     * `Emerald.drawScene`, but can be called manually for custom loops.
     * @param {number} deltaTime - The unscaled delta time in seconds
     */
    static setDeltaTime(deltaTime: number): void;
    /**
     * @method getUnscaledDeltaTime
     * @description Returns the raw delta time, ignoring timeScale
     * @returns {number} - The unscaled delta time
     */
    static getUnscaledDeltaTime(): number;
    /**
     * @method getElapsedTime
     * @description Returns the total accumulated (scaled) time in seconds
     * @returns {number} - The elapsed time
     */
    static getElapsedTime(): number;
    /**
     * @method setTimeScale
     * @description Sets the time scale (1 = normal, 0 = paused, 2 = double speed)
     * @param {number} scale - The time scale (clamped to >= 0)
     */
    static setTimeScale(scale: number): void;
    /**
     * @method getTimeScale
     * @description Returns the current time scale
     * @returns {number} - The time scale
     */
    static getTimeScale(): number;
}
declare namespace Time {
    let deltaTime: number;
    let unscaledDeltaTime: number;
    let elapsedTime: number;
    let timeScale: number;
}
