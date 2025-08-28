import Scene from "../Scene";
/**
 * @class SceneManager
 * @description Manages the scene for the game
 */
declare class SceneManager {
    static scene: Scene | null;
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
    static getScene(): Scene | null;
}
export default SceneManager;
//# sourceMappingURL=SceneManager.d.ts.map