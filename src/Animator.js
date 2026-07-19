import Behaviour from "./components/Behaviour.js";
import Drawable from "./Drawable.js";

/**
 * @class Animator
 * @description A component that manages named animation clips for a Texture (or
 * any Drawable) on the same GameObject. Register clips once, then switch between
 * them by name — handy for character states like idle/run/jump.
 *
 * @example
 * const anim = new Animator();
 * anim.addClip("idle", [0, 1, 2, 3], { speed: 150 });
 * anim.addClip("jump", [8, 9], { speed: 100, loop: false });
 * obj.addComponent(texture);
 * obj.addComponent(anim);
 * anim.play("idle");
 */
class Animator extends Behaviour {
  constructor() {
    super();
    this.clips = new Map();
    this.current = null;
    this.drawable = null;
  }

  /**
   * @method addClip
   * @description Registers a named clip.
   * @param {string} name - The clip name
   * @param {number[]} frames - Frame indices to play
   * @param {Object} [options] - { speed = 100, loop = true }
   * @returns {Animator} - this
   */
  addClip(name, frames, options = {}) {
    const { speed = 100, loop = true } = options;
    this.clips.set(name, { frames, speed, loop });
    return this;
  }

  start() {
    this._resolveDrawable();
  }

  /** @private */
  _resolveDrawable() {
    if (!this.drawable && this.gameObject && this.gameObject.getComponent) {
      this.drawable = this.gameObject.getComponent(Drawable);
    }
    return this.drawable;
  }

  /**
   * @method play
   * @description Plays a registered clip. No-op if it's already current.
   * @param {string} name - The clip name
   * @returns {Animator} - this
   */
  play(name) {
    if (this.current === name) return this;
    const clip = this.clips.get(name);
    const drawable = this._resolveDrawable();
    if (!clip || !drawable) return this;

    this.current = name;
    if (clip.loop) {
      drawable.playAnimation(clip.frames, clip.speed);
    } else {
      drawable.playAnimationOnce(clip.frames, null, clip.speed, () => {
        if (this.current === name) this.current = null;
      });
    }
    return this;
  }

  /**
   * @method stop
   * @description Stops the current animation.
   */
  stop() {
    const drawable = this._resolveDrawable();
    if (drawable) drawable.stopAnimation();
    this.current = null;
  }

  /**
   * @method getCurrent
   * @description Returns the name of the currently playing clip (or null).
   * @returns {string|null}
   */
  getCurrent() {
    return this.current;
  }
}

export default Animator;
