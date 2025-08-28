import { Vector2 } from "../Physics";
/**
 * @class CameraManager
 * @description Manages the camera for the game
 */
declare class CameraManager {
    static camera: any;
    static lastPosition: Vector2 | null;
    /**
     * @method setLastPosition
     * @description Sets the last position of the camera
     * @param {Vector2} position - The position to set
     */
    static setLastPosition(position: Vector2): void;
    /**
     * @method getLastPosition
     * @description Returns the last position of the camera
     * @returns {Vector2} - The last position of the camera
     */
    static getLastPosition(): Vector2 | null;
    /**
     * @method setCamera
     * @description Sets the camera for the game
     * @param {Camera} camera - The camera to set
     */
    static setCamera(camera: any): void;
    /**
     * @method getCamera
     * @description Returns the camera for the game
     * @returns {Camera} - The camera for the game
     */
    static getCamera(): any | null;
}
export default CameraManager;
//# sourceMappingURL=CameraManager.d.ts.map