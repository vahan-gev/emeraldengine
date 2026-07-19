export default Animator;
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
declare class Animator extends Behaviour {
    clips: Map<any, any>;
    current: any;
    drawable: any;
    /**
     * @method addClip
     * @description Registers a named clip.
     * @param {string} name - The clip name
     * @param {number[]} frames - Frame indices to play
     * @param {Object} [options] - { speed = 100, loop = true }
     * @returns {Animator} - this
     */
    addClip(name: string, frames: number[], options?: any): Animator;
    /** @private */
    private _resolveDrawable;
    /**
     * @method play
     * @description Plays a registered clip. No-op if it's already current.
     * @param {string} name - The clip name
     * @returns {Animator} - this
     */
    play(name: string): Animator;
    /**
     * @method stop
     * @description Stops the current animation.
     */
    stop(): void;
    /**
     * @method getCurrent
     * @description Returns the name of the currently playing clip (or null).
     * @returns {string|null}
     */
    getCurrent(): string | null;
}
import Behaviour from "./components/Behaviour.js";
