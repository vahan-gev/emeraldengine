export default Coroutine;
/**
 * @class Coroutine
 * @description Generator-based sequencing for time-based logic, layered on top of
 * the same per-frame delta the rest of the engine uses. Write a generator that
 * `yield`s instructions, and the runner advances it each frame:
 *
 *   - `yield seconds` (a number)        -> wait that many seconds
 *   - `yield Coroutine.waitFrames(n)`   -> wait n frames
 *   - `yield Coroutine.waitUntil(fn)`   -> wait until fn() is truthy
 *   - `yield Coroutine.waitWhile(fn)`   -> wait while fn() is truthy
 *   - `yield somePromise`               -> wait for the promise to resolve
 *   - `yield anotherCoroutine`          -> wait for a nested coroutine to finish
 *   - `yield Coroutine.tween(...)`      -> drive a value over time, then continue
 *
 * Coroutines are driven by `Coroutine.update(dt)` (called automatically from
 * `Emerald.drawScene`, so they honor pause/slow-mo via Time.timeScale).
 *
 * @example
 * Coroutine.start(function* () {
 *   door.open();
 *   yield 1.5;                       // wait 1.5s
 *   yield Coroutine.waitUntil(() => player.isReady);
 *   boss.spawn();
 * });
 */
declare class Coroutine {
    /**
     * @method start
     * @description Starts a coroutine from a generator function (or an existing
     * generator/iterator). Returns a handle with `cancel()` and `done`.
     * @param {GeneratorFunction|Generator} gen - The generator (function) to run
     * @param {...*} args - Arguments forwarded to the generator function
     * @returns {Object} - A handle: { cancel(), done, isRunning() }
     */
    static start(gen: GeneratorFunction | Generator, ...args: any[]): any;
    /**
     * @method waitFrames
     * @description Yieldable that waits a number of frames.
     * @param {number} count - Frames to wait
     */
    static waitFrames(count: number): {
        __coroutine: string;
        count: number;
    };
    /**
     * @method waitUntil
     * @description Yieldable that blocks until the predicate returns truthy.
     * @param {Function} predicate
     */
    static waitUntil(predicate: Function): {
        __coroutine: string;
        predicate: Function;
    };
    /**
     * @method waitWhile
     * @description Yieldable that blocks while the predicate returns truthy.
     * @param {Function} predicate
     */
    static waitWhile(predicate: Function): {
        __coroutine: string;
        predicate: () => boolean;
    };
    /**
     * @method tween
     * @description Yieldable that interpolates from `from` to `to` over `duration`
     * seconds, calling `onUpdate(value)` each frame, then resumes the coroutine.
     * @param {number} from
     * @param {number} to
     * @param {number} duration - Seconds
     * @param {Function} onUpdate - Receives the current value each step
     * @param {Function} [easing] - Optional easing t -> t
     */
    static tween(from: number, to: number, duration: number, onUpdate: Function, easing?: Function): {
        __coroutine: string;
        from: number;
        to: number;
        duration: number;
        onUpdate: Function;
        easing: Function;
        elapsed: number;
    };
    /**
     * @method update
     * @description Advances all running coroutines by dt seconds. Driven by
     * Emerald.drawScene.
     * @param {number} dt - Seconds since the last frame (time-scaled)
     */
    static update(dt: number): void;
    /**
     * @method clearAll
     * @description Cancels and removes every running coroutine.
     */
    static clearAll(): void;
    /**
     * @method count
     * @returns {number} - Number of currently running coroutines
     */
    static count(): number;
    /** @private */
    private static _finish;
    /** @private */
    private static _step;
    /** @private */
    private static _advance;
    /** @private */
    private static _interpret;
}
declare namespace Coroutine {
    let _routines: any[];
}
