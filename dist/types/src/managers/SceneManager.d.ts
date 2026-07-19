export default SceneManager;
/**
 * @class SceneManager
 * @description Manages the scene for the game
 */
declare class SceneManager {
    /**
     * @method setScene
     * @description Sets the scene
     * @param {Scene} scene - The scene to set
     */
    static setScene(scene: Scene): void;
    /**
     * @method getScene
     * @description Returns the scene
     * @returns {Scene} - The scene
     */
    static getScene(): Scene;
    /**
     * @method transitionTo
     * @description Switches the active scene, optionally behind a ScreenEffects
     * fade. With `screenEffects` provided the screen fades out, the scene is
     * swapped (and your optional `onSwap` runs) while covered, then fades back in.
     * Without it the swap happens immediately.
     *
     * @param {Scene} scene - The scene to make active
     * @param {Object} [options]
     * @param {ScreenEffects} [options.screenEffects] - Effects layer to fade with
     * @param {Function} [options.onSwap] - `(scene) => void|Promise`, run during
     *   the covered swap (e.g. (re)build the new scene's contents)
     * @param {number} [options.duration] - Fade duration (seconds)
     * @param {Color} [options.color] - Fade color
     * @returns {Promise<Scene>} - Resolves with the new scene
     */
    static transitionTo(scene: Scene, options?: {
        screenEffects?: ScreenEffects;
        onSwap?: Function;
        duration?: number;
        color?: Color;
    }): Promise<Scene>;
}
declare namespace SceneManager {
    let scene: any;
}
