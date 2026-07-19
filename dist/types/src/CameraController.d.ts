export default CameraController;
/**
 * @class CameraController
 * @description Drives an Emerald camera with follow, bounds clamping, zoom and
 * screen shake. Construct it with `emerald.camera` and call `update(dt)` once
 * per frame.
 *
 * @example
 * const cam = new CameraController(emerald.camera);
 * cam.follow(player.gameObject, 0.1).setBounds(-1000, -1000, 1000, 1000);
 * // in the loop: cam.update(deltaTime);
 */
declare class CameraController {
    /**
     * @param {Object} camera - The Emerald camera (e.g. emerald.camera)
     */
    constructor(camera: any);
    camera: any;
    target: any;
    smoothing: number;
    bounds: {
        minX: any;
        minY: any;
        maxX: any;
        maxY: any;
    };
    position: {
        x: any;
        y: any;
    };
    shakeIntensity: number;
    shakeDuration: number;
    shakeElapsed: number;
    deadzone: {
        x: number;
        y: number;
    };
    /**
     * @method setDeadzone
     * @description Sets a centered follow deadzone. The camera only scrolls when
     * the target moves outside this box, giving the player room to move without
     * the camera reacting to every step. Pass 0/0 or null to disable.
     * @param {number} halfWidth - Horizontal half-extent in world units
     * @param {number} halfHeight - Vertical half-extent in world units
     * @returns {CameraController} - this
     */
    setDeadzone(halfWidth: number, halfHeight: number): CameraController;
    /**
     * @method follow
     * @description Follows a target each frame.
     * @param {Object} target - GameObject/Instance (uses transform.position) or a { x, y }
     * @param {number} smoothing - 0..1, higher snaps faster (1 = instant)
     * @returns {CameraController} - this
     */
    follow(target: any, smoothing?: number): CameraController;
    /**
     * @method stopFollow
     * @description Stops following the current target.
     * @returns {CameraController} - this
     */
    stopFollow(): CameraController;
    /**
     * @method setBounds
     * @description Clamps the camera center to a world-space rectangle.
     * @returns {CameraController} - this
     */
    setBounds(minX: any, minY: any, maxX: any, maxY: any): CameraController;
    /**
     * @method clearBounds
     * @description Removes bounds clamping.
     * @returns {CameraController} - this
     */
    clearBounds(): CameraController;
    /**
     * @method setZoom
     * @description Sets the camera zoom (1 = default, >1 zooms in).
     * @returns {CameraController} - this
     */
    setZoom(zoom: any): CameraController;
    /**
     * @method getZoom
     * @returns {number} - The current zoom
     */
    getZoom(): number;
    /**
     * @method setPosition
     * @description Immediately moves the camera center.
     * @returns {CameraController} - this
     */
    setPosition(x: any, y: any): CameraController;
    /**
     * @method shake
     * @description Triggers a screen shake that decays over its duration.
     * @param {number} intensity - Max offset in world units
     * @param {number} duration - Duration in seconds
     * @returns {CameraController} - this
     */
    shake(intensity: number, duration: number): CameraController;
    /** @private */
    private _targetPosition;
    /**
     * @method update
     * @description Advances follow/shake and applies the result to the camera.
     * @param {number} dt - Seconds since the last frame
     */
    update(dt: number): void;
}
