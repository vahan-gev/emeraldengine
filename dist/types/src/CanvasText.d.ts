export default CanvasText;
/**
 * @class CanvasText
 * @description Renders dynamic text using a system font by drawing to an
 * offscreen 2D canvas and uploading it as a texture. Unlike BitmapText it needs
 * no font sheet and supports any installed font. It's a Drawable component;
 * `CanvasText.create()` returns a ready GameObject sized to the text.
 *
 * @example
 * const label = CanvasText.create("Score: 0", {
 *   font: "bold 28px monospace", color: "#6ee7b7", screenSpace: true,
 * });
 * label.transform.position = new Vector3(-300, 260, 100);
 * scene.add(label);
 * label.getComponent(CanvasText).setText("Score: 120");
 */
declare class CanvasText extends Drawable {
    /**
     * @method wrapText
     * @description Pure helper that breaks `text` into rendered lines. Honors
     * explicit `\n` line breaks and, when `maxWidth > 0`, greedily word-wraps each
     * paragraph so no line measures wider than `maxWidth`. A single word longer
     * than `maxWidth` is kept on its own line rather than being split.
     * @param {(s:string)=>number} measure - Returns the pixel width of a string
     * @param {string} text - The text to lay out
     * @param {number} maxWidth - Wrap width in pixels (0 disables wrapping)
     * @returns {string[]} - The lines to render top to bottom
     */
    static wrapText(measure: (s: string) => number, text: string, maxWidth: number): string[];
    /**
     * @method create
     * @description Convenience factory returning a GameObject sized to the text.
     * @param {string} text
     * @param {Object} [options] - { name, position, screenSpace, font, color,
     *   maxWidth, align, lineHeight, padding }
     * @returns {GameObject}
     */
    static create(text: string, options?: any): GameObject;
    constructor(text: any, options?: {});
    font: any;
    fillStyle: any;
    padding: any;
    maxWidth: any;
    align: any;
    lineHeight: any;
    /** @private */
    private _canvas;
    /** @private */
    private _ctx;
    useTexture: boolean;
    width: number;
    height: number;
    /**
     * @method setText
     * @description Re-renders the text and re-uploads the texture. If attached to
     * a GameObject, its scale is updated to match the new size.
     * @param {string} text
     */
    setText(text: string): void;
    text: string;
    /**
     * @method setMaxWidth
     * @description Sets the wrap width in pixels (0 disables wrapping) and
     * re-renders.
     * @param {number} px
     */
    setMaxWidth(px: number): void;
    /**
     * @method setAlign
     * @description Sets horizontal alignment ("left" | "center" | "right") and
     * re-renders.
     * @param {string} align
     */
    setAlign(align: string): void;
    /**
     * @method setColor
     * @description Sets the text color (CSS color string) and re-renders.
     * @param {string} cssColor
     */
    setColor(cssColor: string): void;
    /**
     * @method getSize
     * @returns {{width:number, height:number}} - The canvas pixel size
     */
    getSize(): {
        width: number;
        height: number;
    };
}
import Drawable from "./Drawable.js";
import GameObject from "./components/GameObject.js";
