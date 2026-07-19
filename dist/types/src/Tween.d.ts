export default Tween;
/**
 * @class Tween
 * @description Animates numeric properties of a target object over time with
 * easing. Tweens created via `Tween.to(...)` are auto-registered and advanced
 * by `Emerald.drawScene` (using time-scaled delta), so they respect pause/slow-mo.
 *
 * @example
 * Tween.to(sprite.transform.position, { x: 200, y: -50 }, 0.6, {
 *   easing: Easing.outBack,
 *   onComplete: () => console.log("done"),
 * });
 */
declare class Tween {
    /**
     * @param {Object} target - The object whose numeric keys will be animated
     * @param {Object} props - Map of key -> end value
     * @param {number} duration - Duration in seconds
     * @param {Object} [options] - { easing, delay, loop, yoyo, onUpdate, onComplete }
     */
    constructor(target: any, props: any, duration: number, options?: any);
    target: any;
    props: any;
    duration: number;
    easing: any;
    delay: any;
    loop: boolean;
    yoyo: boolean;
    onUpdate: any;
    onComplete: any;
    elapsed: number;
    started: boolean;
    done: boolean;
    from: {};
    /** @private */
    private _begin;
    /**
     * @method update
     * @description Advances the tween. Returns false when finished.
     * @param {number} dt - Seconds since the last update
     * @returns {boolean} - Whether the tween is still active
     */
    update(dt: number): boolean;
    /**
     * @method then
     * @description Chains a callback to run when the tween completes.
     * @param {Function} callback
     * @returns {Tween} - this
     */
    then(callback: Function): Tween;
    /**
     * @method stop
     * @description Stops the tween immediately (without firing onComplete).
     */
    stop(): void;
}
declare namespace Tween {
    let active: any[];
    /**
     * @method Tween.to
     * @description Creates and registers a tween.
     * @returns {Tween}
     */
    function to(target: any, props: any, duration: any, options: any): Tween;
    /**
     * @method Tween.update
     * @description Advances all active tweens. Driven by Emerald.drawScene.
     * @param {number} dt - Seconds since the last frame
     */
    function update(dt: number): void;
    /**
     * @method Tween.killOf
     * @description Removes all tweens targeting the given object.
     */
    function killOf(target: any): void;
    /**
     * @method Tween.killAll
     * @description Removes every active tween.
     */
    function killAll(): void;
}
