import GameObject from "./components/GameObject.js";
import { Square2D } from "./Shapes.js";
import { Vector2, Vector3 } from "./Physics.js";
import Color from "./Color.js";
import Easing from "./Easing.js";

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
class ScreenEffects {
  /**
   * @param {Scene} scene - The scene to draw the overlays into
   * @param {Object} [options] - { layer = 100000, size = 5000 }
   */
  constructor(scene, options = {}) {
    this.scene = scene;
    const layer = options.layer ?? 100000;
    const half = options.size ?? 5000;

    /** @private */
    this._fade = this._makeQuad(layer, half, new Color(0, 0, 0, 255));
    /** @private */
    this._flashQuad = this._makeQuad(
      layer + 1,
      half,
      new Color(255, 255, 255, 255)
    );

    /** @private */
    this._barTop = this._makeQuad(layer + 2, half, new Color(0, 0, 0, 255));
    /** @private */
    this._barBottom = this._makeQuad(layer + 2, half, new Color(0, 0, 0, 255));
    this._barTop.setOpacity(0);
    this._barBottom.setOpacity(0);
    /** @private */
    this._letterboxHeight = 0;
    /** @private */
    this._letterboxTarget = 0;
    /** @private */
    this._barHalf = half;

    /** @private */
    this._fadeAnim = null;
    /** @private */
    this._flashAnim = null;
  }

  /** @private */
  _makeQuad(layer, half, color) {
    const go = new GameObject(
      "ScreenEffect",
      new Vector3(0, 0, 0),
      0,
      new Vector2(half, half)
    );
    const shape = new Square2D();
    shape.setColor(color);
    shape.setUseLighting(false);
    go.addComponent(shape);
    go.setScreenSpace(true);
    go.setLayer(layer);
    go.alwaysVisible = true;
    go.setOpacity(0);
    /** @private */
    this._shapeOf = this._shapeOf || new WeakMap();
    this._shapeOf.set(go, shape);
    this.scene.add(go);
    return go;
  }

  /** @private */
  _setColor(go, color) {
    const shape = this._shapeOf.get(go);
    if (shape) shape.setColor(color);
  }

  /**
   * @method fadeOut
   * @description Fades the screen to a solid color (opacity 0 -> 1).
   * @param {number} duration - Seconds
   * @param {Color} [color] - Target color (default black)
   * @param {Function} [easing] - Easing function (default linear)
   * @returns {Promise<void>} - Resolves when the fade completes
   */
  fadeOut(
    duration = 0.4,
    color = new Color(0, 0, 0, 255),
    easing = Easing.linear
  ) {
    this._setColor(this._fade, color);
    return this._startFade(this._fade.getOpacity(), 1, duration, easing);
  }

  /**
   * @method fadeIn
   * @description Fades the screen back in from the current overlay (opacity -> 0).
   * @param {number} duration - Seconds
   * @param {Function} [easing] - Easing function (default linear)
   * @returns {Promise<void>}
   */
  fadeIn(duration = 0.4, easing = Easing.linear) {
    return this._startFade(this._fade.getOpacity(), 0, duration, easing);
  }

  /** @private */
  _startFade(from, to, duration, easing) {
    return new Promise((resolve) => {
      if (this._fadeAnim && this._fadeAnim.resolve) this._fadeAnim.resolve();
      if (duration <= 0) {
        this._fade.setOpacity(to);
        resolve();
        this._fadeAnim = null;
        return;
      }
      this._fadeAnim = { from, to, elapsed: 0, duration, easing, resolve };
    });
  }

  /**
   * @method flash
   * @description Flashes a color that ramps to full then fades out.
   * @param {Color} [color] - Flash color (default white)
   * @param {number} duration - Total seconds for the flash
   * @returns {Promise<void>}
   */
  flash(color = new Color(255, 255, 255, 255), duration = 0.2) {
    this._setColor(this._flashQuad, color);
    return new Promise((resolve) => {
      if (this._flashAnim && this._flashAnim.resolve) this._flashAnim.resolve();
      this._flashAnim = {
        elapsed: 0,
        duration: Math.max(0.0001, duration),
        resolve,
      };
    });
  }

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
  async transition(swap, options = {}) {
    const {
      duration = 0.4,
      color = new Color(0, 0, 0, 255),
      outDuration,
      inDuration,
      easing = Easing.linear,
    } = options;
    await this.fadeOut(outDuration ?? duration, color, easing);
    if (typeof swap === "function") await swap();
    await this.fadeIn(inDuration ?? duration, easing);
  }

  /**
   * @method setLetterbox
   * @description Animates cinematic black bars to the given height (in pixels,
   * per bar). Pass 0 to retract them.
   * @param {number} heightPx - Target bar height in pixels
   */
  setLetterbox(heightPx) {
    this._letterboxTarget = Math.max(0, heightPx);
  }

  /**
   * @method update
   * @description Advances all active transitions. Call once per frame.
   * @param {number} dt - Seconds since last frame
   */
  update(dt) {
    if (this._fadeAnim) {
      const a = this._fadeAnim;
      a.elapsed += dt;
      const k = Math.min(1, a.elapsed / a.duration);
      const eased = a.easing(k);
      this._fade.setOpacity(a.from + (a.to - a.from) * eased);
      if (k >= 1) {
        const resolve = a.resolve;
        this._fadeAnim = null;
        if (resolve) resolve();
      }
    }

    if (this._flashAnim) {
      const a = this._flashAnim;
      a.elapsed += dt;
      const k = Math.min(1, a.elapsed / a.duration);
      const opacity = k < 0.25 ? k / 0.25 : 1 - (k - 0.25) / 0.75;
      this._flashQuad.setOpacity(Math.max(0, opacity));
      if (k >= 1) {
        const resolve = a.resolve;
        this._flashAnim = null;
        this._flashQuad.setOpacity(0);
        if (resolve) resolve();
      }
    }

    if (this._letterboxHeight !== this._letterboxTarget) {
      const speed = 1200;
      const dir = Math.sign(this._letterboxTarget - this._letterboxHeight);
      this._letterboxHeight += dir * speed * dt;
      if (
        (dir > 0 && this._letterboxHeight > this._letterboxTarget) ||
        (dir < 0 && this._letterboxHeight < this._letterboxTarget)
      ) {
        this._letterboxHeight = this._letterboxTarget;
      }
    }
    const visible = this._letterboxHeight > 0.5;
    this._barTop.setOpacity(visible ? 1 : 0);
    this._barBottom.setOpacity(visible ? 1 : 0);
    if (visible) {
      const offset =
        this._barHalf + this._screenHalfHeight() - this._letterboxHeight;
      this._barTop.transform.position.y = offset;
      this._barBottom.transform.position.y = -offset;
    }
  }

  /** @private */
  _screenHalfHeight() {
    if (typeof window !== "undefined" && window.innerHeight) {
      return window.innerHeight / 2;
    }
    return 360;
  }

  /**
   * @method destroy
   * @description Removes all overlay objects from the scene.
   */
  destroy() {
    for (const go of [
      this._fade,
      this._flashQuad,
      this._barTop,
      this._barBottom,
    ]) {
      this.scene.remove(go);
    }
  }
}

export default ScreenEffects;
