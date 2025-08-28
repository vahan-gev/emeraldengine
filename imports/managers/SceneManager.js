/**
 * @class SceneManager
 * @description Manages the scene for the game
 */
class SceneManager {
  static scene = null;

  /**
   * @method setScene
   * @description Sets the scene
   * @param {Scene} scene - The scene to set
   */
  static setScene(scene) {
    this.scene = scene;
  }

  /**
   * @method getScene
   * @description Returns the scene
   * @returns {Scene} - The scene
   */
  static getScene() {
    return this.scene;
  }
}

export default SceneManager;
