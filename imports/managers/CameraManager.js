/**
 * @class CameraManager
 * @description Manages the camera for the game
 */
class CameraManager {
  static camera = null;
  static lastPosition = null;

  /**
   * @method setLastPosition
   * @description Sets the last position of the camera
   * @param {Vector2} position - The position to set
   */
  static setLastPosition(position) {
    this.lastPosition = position;
  }

  /**
   * @method getLastPosition
   * @description Returns the last position of the camera
   * @returns {Vector2} - The last position of the camera
   */
  static getLastPosition() {
    if (this.lastPosition) {
      return this.lastPosition;
    } else {
      console.warn("Last position is not set.");
      return null;
    }
  }

  /**
   * @method setCamera
   * @description Sets the camera for the game
   * @param {Camera} camera - The camera to set
   */
  static setCamera(camera) {
    if (camera) {
      this.camera = camera;
    } else {
      console.warn("Attempted to set camera to null or undefined.");
    }
  }

  /**
   * @method getCamera
   * @description Returns the camera for the game
   * @returns {Camera} - The camera for the game
   */
  static getCamera() {
    if (this.camera) {
      return this.camera;
    } else {
      console.warn("Camera is not set.");
      return null;
    }
  }
}

export default CameraManager;
