export default Camera;
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
declare class Camera {
    constructor(options?: {});
    transform: Transform;
    viewport: {
        x: any;
        y: any;
        width: any;
        height: any;
    };
    active: boolean;
    clearColor: any;
    ignoreLayers: Set<any>;
    onlyLayers: Set<any>;
    excludeFromPost: boolean;
    pixelSnap: boolean;
    /**
     * @method setPixelSnap
     * @description When true, the camera's rendered position is rounded to whole
     * screen pixels each frame (the stored position stays smooth). Use it for
     * pixel-art games to eliminate sub-pixel shimmer and tile seams while a
     * smooth-follow camera moves. Ignored while the camera is rotated.
     * @param {boolean} snap
     * @returns {Camera} - this
     */
    setPixelSnap(snap: boolean): Camera;
    /**
     * @method setExcludeFromPost
     * @description When true, this camera renders straight to the screen AFTER the
     * post-processing pass instead of into the post-processed scene buffer. Use it
     * for HUD/UI cameras so effects like bloom don't affect the interface.
     * @param {boolean} exclude
     * @returns {Camera} - this
     */
    setExcludeFromPost(exclude: boolean): Camera;
    /**
     * @method setOnlyLayers
     * @description Restricts the camera to rendering only the given layers (or
     * pass null to clear the restriction).
     * @param {number[]|null} layers
     * @returns {Camera} - this
     */
    setOnlyLayers(layers: number[] | null): Camera;
    /**
     * @method setIgnoreLayers
     * @description Replaces the set of layers this camera skips when rendering.
     * @param {number[]} layers - Layer indices to ignore
     * @returns {Camera} - this
     */
    setIgnoreLayers(layers: number[]): Camera;
    /**
     * @method ignoreLayer
     * @description Adds a single layer to the ignore set.
     * @param {number} layer
     * @returns {Camera} - this
     */
    ignoreLayer(layer: number): Camera;
    /**
     * @method setPosition
     * @description Sets the world-space center of the camera.
     */
    setPosition(x: any, y: any, z?: number): void;
    /**
     * @method getPosition
     * @description Returns the world-space center of the camera.
     */
    getPosition(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * @method setZoom
     * @description Sets the zoom (1 = default, >1 zooms in).
     */
    setZoom(zoom: any): void;
    /**
     * @method getZoom
     * @returns {number}
     */
    getZoom(): number;
    /**
     * @method setRotation
     * @description Sets the camera rotation in radians.
     */
    setRotation(radians: any): void;
    /**
     * @method getRotation
     * @returns {number}
     */
    getRotation(): number;
    /**
     * @method setViewport
     * @description Sets the normalized viewport rectangle (origin bottom-left).
     * @returns {Camera} - this
     */
    setViewport(x: any, y: any, width: any, height: any): Camera;
    /**
     * @method setActive
     * @description Enables/disables rendering of this camera.
     * @returns {Camera} - this
     */
    setActive(active: any): Camera;
}
import Transform from "./Transform.js";
