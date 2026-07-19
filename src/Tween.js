import Easing from "./Easing.js";

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
class Tween {
  /**
   * @param {Object} target - The object whose numeric keys will be animated
   * @param {Object} props - Map of key -> end value
   * @param {number} duration - Duration in seconds
   * @param {Object} [options] - { easing, delay, loop, yoyo, onUpdate, onComplete }
   */
  constructor(target, props, duration, options = {}) {
    this.target = target;
    this.props = props;
    this.duration = Math.max(1e-4, duration);
    this.easing = options.easing || Easing.linear;
    this.delay = options.delay || 0;
    this.loop = !!options.loop;
    this.yoyo = !!options.yoyo;
    this.onUpdate = options.onUpdate || null;
    this.onComplete = options.onComplete || null;

    this.elapsed = 0;
    this.started = false;
    this.done = false;
    this.from = {};
  }

  /** @private */
  _begin() {
    for (const key in this.props) {
      this.from[key] = this.target[key];
    }
    this.started = true;
  }

  /**
   * @method update
   * @description Advances the tween. Returns false when finished.
   * @param {number} dt - Seconds since the last update
   * @returns {boolean} - Whether the tween is still active
   */
  update(dt) {
    if (this.done) return false;

    if (this.delay > 0) {
      this.delay -= dt;
      if (this.delay > 0) return true;
      dt = -this.delay;
      this.delay = 0;
    }

    if (!this.started) this._begin();

    this.elapsed += dt;
    const t = Math.min(1, this.elapsed / this.duration);
    const e = this.easing(t);

    for (const key in this.props) {
      this.target[key] = this.from[key] + (this.props[key] - this.from[key]) * e;
    }
    if (this.onUpdate) this.onUpdate(this.target, t);

    if (t >= 1) {
      if (this.loop) {
        this.elapsed = 0;
        if (this.yoyo) {
          const swap = this.from;
          this.from = this.props;
          this.props = swap;
        } else {
          for (const key in this.props) this.target[key] = this.from[key];
        }
      } else {
        this.done = true;
        if (this.onComplete) this.onComplete(this.target);
        return false;
      }
    }
    return true;
  }

  /**
   * @method then
   * @description Chains a callback to run when the tween completes.
   * @param {Function} callback
   * @returns {Tween} - this
   */
  then(callback) {
    const prev = this.onComplete;
    this.onComplete = (target) => {
      if (prev) prev(target);
      callback(target);
    };
    return this;
  }

  /**
   * @method stop
   * @description Stops the tween immediately (without firing onComplete).
   */
  stop() {
    this.done = true;
  }
}

Tween.active = [];

/**
 * @method Tween.to
 * @description Creates and registers a tween.
 * @returns {Tween}
 */
Tween.to = function (target, props, duration, options) {
  const tween = new Tween(target, props, duration, options);
  Tween.active.push(tween);
  return tween;
};

/**
 * @method Tween.update
 * @description Advances all active tweens. Driven by Emerald.drawScene.
 * @param {number} dt - Seconds since the last frame
 */
Tween.update = function (dt) {
  for (let i = Tween.active.length - 1; i >= 0; i--) {
    if (!Tween.active[i].update(dt)) {
      Tween.active.splice(i, 1);
    }
  }
};

/**
 * @method Tween.killOf
 * @description Removes all tweens targeting the given object.
 */
Tween.killOf = function (target) {
  Tween.active = Tween.active.filter((tween) => tween.target !== target);
};

/**
 * @method Tween.killAll
 * @description Removes every active tween.
 */
Tween.killAll = function () {
  Tween.active.length = 0;
};

export default Tween;
