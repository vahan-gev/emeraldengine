export default ScreenEffects;
/**
 * @class ScreenEffects
 * @description In-engine full-screen camera/transition effects: fade to/from a
 * color, screen flash, and cinematic letterbox bars. Everything is drawn with
 * the engine's own screen-space quads (no DOM/CSS overlay), so it survives
 * resolution changes, post-processing, and split-screen (the quads overfill
 * every viewport and are clipped per camera).
 *
 * Add it to your scene's update loop by calling `update(dt)` each frame.
 *
 * @example
 * const fx = new ScreenEffects(scene, { layer: 100000 });
 * await fx.fadeOut(0.4, new Color(0,0,0,255));  // to black
 * loadNextLevel();
 * await fx.fadeIn(0.4);
 * // bumps:
 * fx.flash(new Color(255,255,255,255), 0.15);
 * // in the loop, before drawScene: fx.update(dt);
 */
declare class ScreenEffects {
    /**
     * @param {Scene} scene - The scene to draw the overlays into
     * @param {Object} [options] - { layer = 100000, size = 5000 }
     */
    constructor(scene: Scene, options?: any);
    scene: Scene;
    /** @private */
    private _fade;
    /** @private */
    private _flashQuad;
    /** @private */
    private _barTop;
    /** @private */
    private _barBottom;
    /** @private */
    private _letterboxHeight;
    /** @private */
    private _letterboxTarget;
    /** @private */
    private _barHalf;
    /** @private */
    private _fadeAnim;
    /** @private */
    private _flashAnim;
    /** @private */
    private _makeQuad;
    /** @private */
    private _shapeOf;
    /** @private */
    private _setColor;
    /**
     * @method fadeOut
     * @description Fades the screen to a solid color (opacity 0 -> 1).
     * @param {number} duration - Seconds
     * @param {Color} [color] - Target color (default black)
     * @param {Function} [easing] - Easing function (default linear)
     * @returns {Promise<void>} - Resolves when the fade completes
     */
    fadeOut(duration?: number, color?: Color, easing?: Function): Promise<void>;
    /**
     * @method fadeIn
     * @description Fades the screen back in from the current overlay (opacity -> 0).
     * @param {number} duration - Seconds
     * @param {Function} [easing] - Easing function (default linear)
     * @returns {Promise<void>}
     */
    fadeIn(duration?: number, easing?: Function): Promise<void>;
    /** @private */
    private _startFade;
    /**
     * @method flash
     * @description Flashes a color that ramps to full then fades out.
     * @param {Color} [color] - Flash color (default white)
     * @param {number} duration - Total seconds for the flash
     * @returns {Promise<void>}
     */
    flash(color?: Color, duration?: number): Promise<void>;
    /**
     * @method transition
     * @description Fades the screen out to a color, runs a swap callback at the
     * darkest point (e.g. tear down the old scene and build the new one), then
     * fades back in. Requires `update(dt)` to be pumped each frame by your loop.
     * @param {Function} swap - Called (and awaited) while the screen is covered
     * @param {Object} [options] - { duration = 0.4, color = black, outDuration,
     *   inDuration, easing }
     * @returns {Promise<void>} - Resolves after the fade-in completes
     */
    transition(swap: Function, options?: any): Promise<void>;
    /**
     * @method setLetterbox
     * @description Animates cinematic black bars to the given height (in pixels,
     * per bar). Pass 0 to retract them.
     * @param {number} heightPx - Target bar height in pixels
     */
    setLetterbox(heightPx: number): void;
    /**
     * @method update
     * @description Advances all active transitions. Call once per frame.
     * @param {number} dt - Seconds since last frame
     */
    update(dt: number): void;
    /** @private */
    private _screenHalfHeight;
    /**
     * @method destroy
     * @description Removes all overlay objects from the scene.
     */
    destroy(): void;
}
import Color from "./Color.js";
