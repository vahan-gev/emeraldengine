export default DebugOverlay;
/**
 * @class DebugOverlay
 * @description A DOM panel that profiles the running game: FPS, frame-time stats
 * with a live sparkline graph, object/camera counts, the primary camera's
 * position/zoom, JS heap usage (where available), and any extra metrics you
 * push. It can also toggle physics collider debug shapes on a scene.
 *
 * Call `update(emerald, scene)` each frame; toggle visibility with `setVisible`.
 *
 * @example
 * const debug = new DebugOverlay();
 * // each frame, after drawScene:
 * debug.update(emerald, scene);
 * debug.setMetric("draws", spriteBatch.drawCalls);
 * debug.showColliders(scene, true); // visualize physics colliders
 */
declare class DebugOverlay {
    constructor(options?: {});
    element: HTMLDivElement;
    /** @private */
    private _graph;
    /** @private */
    private _gctx;
    /** @private */
    private _text;
    /** @private */
    private _last;
    /** @private */
    private _frames;
    /** @private */
    private _accum;
    fps: number;
    /** @private */
    private _frameTimes;
    /** @private */
    private _maxSamples;
    /** @private */
    private _dtMs;
    /** @private */
    private _minMs;
    /** @private */
    private _maxMs;
    /** @private */
    private _avgMs;
    /** @private */
    private _metrics;
    /** @private */
    private _colliderScene;
    /** @private */
    private _collidersShown;
    /**
     * @method setMetric
     * @description Adds/updates a custom metric line shown in the panel.
     * @param {string} key
     * @param {*} value
     */
    setMetric(key: string, value: any): void;
    /**
     * @method update
     * @description Updates the overlay. Pass the engine and current scene.
     * @param {Emerald} emerald
     * @param {Scene} scene
     */
    update(emerald: Emerald, scene: Scene): void;
    /** @private */
    private _drawGraph;
    /**
     * @method showColliders
     * @description Toggles physics collider debug shapes for every RigidBody in a
     * scene's objects (uses the lazy debug shapes on each collider).
     * @param {Scene} scene
     * @param {boolean} show
     */
    showColliders(scene: Scene, show: boolean): void;
    /**
     * @method setVisible
     * @param {boolean} visible
     */
    setVisible(visible: boolean): void;
    /**
     * @method destroy
     * @description Removes the overlay from the DOM.
     */
    destroy(): void;
}
