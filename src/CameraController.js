import MathUtils from "./MathUtils.js";

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
class CameraController {
  /**
   * @param {Object} camera - The Emerald camera (e.g. emerald.camera)
   */
  constructor(camera) {
    this.camera = camera;
    this.target = null;
    this.smoothing = 1;
    this.bounds = null;

    const start = camera.getPosition ? camera.getPosition() : { x: 0, y: 0 };
    this.position = { x: start.x, y: start.y };

    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeElapsed = Infinity;

    this.deadzone = null;
  }

  /**
   * @method setDeadzone
   * @description Sets a centered follow deadzone. The camera only scrolls when
   * the target moves outside this box, giving the player room to move without
   * the camera reacting to every step. Pass 0/0 or null to disable.
   * @param {number} halfWidth - Horizontal half-extent in world units
   * @param {number} halfHeight - Vertical half-extent in world units
   * @returns {CameraController} - this
   */
  setDeadzone(halfWidth, halfHeight) {
    this.deadzone =
      halfWidth || halfHeight
        ? { x: Math.abs(halfWidth || 0), y: Math.abs(halfHeight || 0) }
        : null;
    return this;
  }

  /**
   * @method follow
   * @description Follows a target each frame.
   * @param {Object} target - GameObject/Instance (uses transform.position) or a { x, y }
   * @param {number} smoothing - 0..1, higher snaps faster (1 = instant)
   * @returns {CameraController} - this
   */
  follow(target, smoothing = 0.1) {
    this.target = target;
    this.smoothing = smoothing;
    return this;
  }

  /**
   * @method stopFollow
   * @description Stops following the current target.
   * @returns {CameraController} - this
   */
  stopFollow() {
    this.target = null;
    return this;
  }

  /**
   * @method setBounds
   * @description Clamps the camera center to a world-space rectangle.
   * @returns {CameraController} - this
   */
  setBounds(minX, minY, maxX, maxY) {
    this.bounds = { minX, minY, maxX, maxY };
    return this;
  }

  /**
   * @method clearBounds
   * @description Removes bounds clamping.
   * @returns {CameraController} - this
   */
  clearBounds() {
    this.bounds = null;
    return this;
  }

  /**
   * @method setZoom
   * @description Sets the camera zoom (1 = default, >1 zooms in).
   * @returns {CameraController} - this
   */
  setZoom(zoom) {
    if (this.camera.setZoom) this.camera.setZoom(zoom);
    return this;
  }

  /**
   * @method getZoom
   * @returns {number} - The current zoom
   */
  getZoom() {
    return this.camera.getZoom ? this.camera.getZoom() : 1;
  }

  /**
   * @method setPosition
   * @description Immediately moves the camera center.
   * @returns {CameraController} - this
   */
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
    this.camera.setPosition(x, y, 0);
    return this;
  }

  /**
   * @method shake
   * @description Triggers a screen shake that decays over its duration.
   * @param {number} intensity - Max offset in world units
   * @param {number} duration - Duration in seconds
   * @returns {CameraController} - this
   */
  shake(intensity, duration) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeElapsed = 0;
    return this;
  }

  /** @private */
  _targetPosition() {
    const t = this.target;
    if (!t) return null;
    if (t.transform && t.transform.position) return t.transform.position;
    return t;
  }

  /**
   * @method update
   * @description Advances follow/shake and applies the result to the camera.
   * @param {number} dt - Seconds since the last frame
   */
  update(dt) {
    const targetPos = this._targetPosition();
    if (targetPos) {
      let goalX = targetPos.x;
      let goalY = targetPos.y;
      if (this.deadzone) {
        goalX = this.position.x;
        goalY = this.position.y;
        const dx = targetPos.x - this.position.x;
        const dy = targetPos.y - this.position.y;
        if (dx > this.deadzone.x) goalX = targetPos.x - this.deadzone.x;
        else if (dx < -this.deadzone.x) goalX = targetPos.x + this.deadzone.x;
        if (dy > this.deadzone.y) goalY = targetPos.y - this.deadzone.y;
        else if (dy < -this.deadzone.y) goalY = targetPos.y + this.deadzone.y;
      }

      const s = MathUtils.clamp(this.smoothing, 0, 1);
      const a = s >= 1 ? 1 : 1 - Math.pow(1 - s, dt * 60);
      this.position.x = MathUtils.lerp(this.position.x, goalX, a);
      this.position.y = MathUtils.lerp(this.position.y, goalY, a);
    }

    let x = this.position.x;
    let y = this.position.y;

    if (this.bounds) {
      x = MathUtils.clamp(x, this.bounds.minX, this.bounds.maxX);
      y = MathUtils.clamp(y, this.bounds.minY, this.bounds.maxY);
    }

    if (this.shakeElapsed < this.shakeDuration) {
      this.shakeElapsed += dt;
      const falloff = Math.max(0, 1 - this.shakeElapsed / this.shakeDuration);
      x += (Math.random() * 2 - 1) * this.shakeIntensity * falloff;
      y += (Math.random() * 2 - 1) * this.shakeIntensity * falloff;
    }

    this.camera.setPosition(x, y, 0);
  }
}

export default CameraController;
