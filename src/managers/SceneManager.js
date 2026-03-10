/**
 * @class SceneManager
 * @description Manages the scene for the game
 */
class SceneManager {
  /**
   * @method setScene
   * @description Sets the scene
   * @param {Scene} scene - The scene to set
   */
  static setScene(scene) {
    SceneManager.scene = scene;
  }

  /**
   * @method getScene
   * @description Returns the scene
   * @returns {Scene} - The scene
   */
  static getScene() {
    return SceneManager.scene;
  }
}

SceneManager.scene = null;

export default SceneManager;
