import Transform from "./Transform.js";
import { Vector2, Vector3 } from "./Physics.js";

/**
 * @class Camera
 * @description A view into the scene with its own transform (position, zoom,
 * rotation) and a viewport rectangle. Multiple cameras can be added to an
 * Emerald instance to render split-screen or picture-in-picture. The viewport
 * is expressed in normalized [0..1] coordinates with the origin at the
 * bottom-left of the canvas (matching WebGL).
 *
 * Backward compatible with the previous inline camera: position is stored
 * negated internally, and setPosition/getPosition/setZoom/getZoom behave the
 * same, so EventManager and CameraController are unaffected.
 *
 * @example
 * const left = new Camera({ viewport: { x: 0, y: 0, width: 0.5, height: 1 } });
 * const right = new Camera({ viewport: { x: 0.5, y: 0, width: 0.5, height: 1 } });
 * emerald.setCameras([left, right]);
 */
class Camera {
  constructor(options = {}) {
    this.transform = new Transform(new Vector3(0, 0, 0), 0, new Vector2(1, 1));

    const vp = options.viewport || {};
    this.viewport = {
      x: vp.x ?? 0,
      y: vp.y ?? 0,
      width: vp.width ?? 1,
      height: vp.height ?? 1,
    };

    this.active = options.active !== false;
    this.clearColor = options.clearColor || null;

    this.ignoreLayers = new Set(options.ignoreLayers || []);

    this.onlyLayers = options.onlyLayers ? new Set(options.onlyLayers) : null;

    this.excludeFromPost = options.excludeFromPost === true;

    this.pixelSnap = options.pixelSnap === true;
  }

  /**
   * @method setPixelSnap
   * @description When true, the camera's rendered position is rounded to whole
   * screen pixels each frame (the stored position stays smooth). Use it for
   * pixel-art games to eliminate sub-pixel shimmer and tile seams while a
   * smooth-follow camera moves. Ignored while the camera is rotated.
   * @param {boolean} snap
   * @returns {Camera} - this
   */
  setPixelSnap(snap) {
    this.pixelSnap = snap !== false;
    return this;
  }

  /**
   * @method setExcludeFromPost
   * @description When true, this camera renders straight to the screen AFTER the
   * post-processing pass instead of into the post-processed scene buffer. Use it
   * for HUD/UI cameras so effects like bloom don't affect the interface.
   * @param {boolean} exclude
   * @returns {Camera} - this
   */
  setExcludeFromPost(exclude) {
    this.excludeFromPost = exclude !== false;
    return this;
  }

  /**
   * @method setOnlyLayers
   * @description Restricts the camera to rendering only the given layers (or
   * pass null to clear the restriction).
   * @param {number[]|null} layers
   * @returns {Camera} - this
   */
  setOnlyLayers(layers) {
    this.onlyLayers = layers ? new Set(layers) : null;
    return this;
  }

  /**
   * @method setIgnoreLayers
   * @description Replaces the set of layers this camera skips when rendering.
   * @param {number[]} layers - Layer indices to ignore
   * @returns {Camera} - this
   */
  setIgnoreLayers(layers) {
    this.ignoreLayers = new Set(layers);
    return this;
  }

  /**
   * @method ignoreLayer
   * @description Adds a single layer to the ignore set.
   * @param {number} layer
   * @returns {Camera} - this
   */
  ignoreLayer(layer) {
    this.ignoreLayers.add(layer);
    return this;
  }

  /**
   * @method setPosition
   * @description Sets the world-space center of the camera.
   */
  setPosition(x, y, z = 0) {
    this.transform.position.x = -x;
    this.transform.position.y = -y;
    this.transform.position.z = -z;
  }

  /**
   * @method getPosition
   * @description Returns the world-space center of the camera.
   */
  getPosition() {
    return {
      x: -this.transform.position.x,
      y: -this.transform.position.y,
      z: -this.transform.position.z,
    };
  }

  /**
   * @method setZoom
   * @description Sets the zoom (1 = default, >1 zooms in).
   */
  setZoom(zoom) {
    const z = Math.max(0.0001, zoom);
    this.transform.scale.x = z;
    this.transform.scale.y = z;
  }

  /**
   * @method getZoom
   * @returns {number}
   */
  getZoom() {
    return this.transform.scale.x;
  }

  /**
   * @method setRotation
   * @description Sets the camera rotation in radians.
   */
  setRotation(radians) {
    this.transform.rotation = radians;
  }

  /**
   * @method getRotation
   * @returns {number}
   */
  getRotation() {
    return this.transform.rotation;
  }

  /**
   * @method setViewport
   * @description Sets the normalized viewport rectangle (origin bottom-left).
   * @returns {Camera} - this
   */
  setViewport(x, y, width, height) {
    this.viewport = { x, y, width, height };
    return this;
  }

  /**
   * @method setActive
   * @description Enables/disables rendering of this camera.
   * @returns {Camera} - this
   */
  setActive(active) {
    this.active = active;
    return this;
  }
}

export default Camera;
