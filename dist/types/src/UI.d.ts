export default UI;
/**
 * @class UI
 * @description A small retained-mode UI toolkit rendered entirely with the
 * engine (no DOM/HTML overlay): panels, labels, buttons and text fields, drawn
 * as screen-space objects on a dedicated layer with their own pointer/keyboard
 * hit-testing. Positions are in pixels from the viewport center (y up), or a
 * `(viewW, viewH) => ({x, y})` function for responsive anchoring; call
 * `relayout()` on resize.
 *
 * Pair it with a UI camera (see {@link UI.createCamera}) so the UI draws over
 * the game and the game cameras ignore the UI layer.
 *
 * @example
 * const uiCam = UI.createCamera();           // onlyLayers = [UI layer]
 * gameCamera.ignoreLayer(UI.LAYER);
 * emerald.setCameras([gameCamera, uiCam]);
 *
 * const ui = new UI(scene, canvas);
 * ui.label(() => ({ x: 0, y: 200 }), "PAUSED", { font: "700 48px sans-serif" });
 * ui.button(() => ({ x: 0, y: 0 }), "Resume", 220, 56, { onClick: resume });
 * // in the loop: ui.relayout() on resize; remove input via ui.destroy().
 */
declare class UI {
    /**
     * @method createCamera
     * @description Returns a full-screen camera that renders only the UI layer,
     * so UI draws over the game. Add it last in setCameras.
     * @param {number} [layer] - The UI layer (defaults to UI.LAYER)
     * @returns {Camera}
     */
    static createCamera(layer?: number): Camera;
    /**
     * @param {Scene} scene - Scene to add UI objects to
     * @param {HTMLCanvasElement} canvas - Canvas for pointer coordinates
     * @param {Object} [options] - { layer = UI.LAYER, accent = [110,180,255] }
     */
    constructor(scene: Scene, canvas: HTMLCanvasElement, options?: any);
    scene: Scene;
    canvas: HTMLCanvasElement;
    layer: any;
    accent: any;
    elements: any[];
    focused: any;
    /** @private */
    private _hover;
    /** @private */
    private _onMove;
    /** @private */
    private _onDown;
    /** @private */
    private _onKey;
    /** @private */
    private _resolvePos;
    /**
     * @method relayout
     * @description Recomputes positions of all elements (call after a resize).
     */
    relayout(): void;
    /**
     * @method panel
     * @description Adds a rectangular panel.
     * @returns {Object} - Element handle
     */
    panel(pos: any, width: any, height: any, options?: {}): any;
    /**
     * @method dim
     * @description Adds a full-screen dimmer (modal backdrop).
     * @returns {Object} - Element handle
     */
    dim(opacity?: number): any;
    /**
     * @method label
     * @description Adds a text label.
     * @returns {Object} - Element handle with setText(text)
     */
    label(pos: any, text: any, options?: {}): any;
    /**
     * @method button
     * @description Adds an interactive button (panel + centered label).
     * @param {Object} [options] - { onClick, accent, font, color }
     * @returns {Object} - Element handle with setText(text), setEnabled(bool)
     */
    button(pos: any, text: any, width: any, height: any, options?: any): any;
    /**
     * @method textField
     * @description Adds an editable single-line text field.
     * @param {Object} [options] - { value, placeholder, onChange, maxLength, font }
     * @returns {Object} - Element handle with getValue()/setValue(text)
     */
    textField(pos: any, width: any, height: any, options?: any): any;
    /** @private */
    private _makeQuad;
    /** @private */
    private _register;
    /** @private */
    private _toScreen;
    /** @private */
    private _hitTest;
    /**
     * @method isOver
     * @description Whether an interactive element is under the given page point —
     * useful to suppress game clicks behind the UI.
     */
    isOver(clientX: any, clientY: any): boolean;
    /** @private */
    private _handleMove;
    /** @private */
    private _handleDown;
    /** @private */
    private _handleKey;
    /**
     * @method destroy
     * @description Removes all UI objects and detaches input listeners.
     */
    destroy(): void;
}
declare namespace UI {
    let LAYER: number;
}
import Camera from "./Camera.js";
