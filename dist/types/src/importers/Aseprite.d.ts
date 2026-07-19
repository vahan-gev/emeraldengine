export default Aseprite;
/**
 * @class Aseprite
 * @description Imports sprite-sheet metadata exported from Aseprite
 * (File ▸ Export Sprite Sheet, with "JSON Data" on) and turns its frame tags
 * into engine animation clips. Works with both the Hash and Array JSON layouts.
 * Pure parsing — pass it the already-parsed JSON object.
 *
 * Assumes the sheet is a uniform grid in frame order (the common case), so the
 * frame indices line up with the engine's Texture/Animator frame numbering.
 *
 * @example
 * const cfg = Aseprite.spriteConfig(sheetJson); // {frameWidth, framesPerRow, ...}
 * const tex = new Texture("hero.png", cfg.frameWidth, cfg.frameHeight,
 *   cfg.framesPerRow, cfg.totalFrames, 0, false);
 * obj.addComponent(tex);
 * const anim = new Animator();
 * obj.addComponent(anim);
 * Aseprite.applyTo(anim, sheetJson);   // registers "idle", "run", ... clips
 * anim.play("run");
 */
declare class Aseprite {
    /**
     * @method frames
     * @description Returns the frames as an ordered array regardless of whether
     * the export used the Hash (object) or Array layout.
     * @param {Object} sheet - Parsed Aseprite JSON
     * @returns {Array<Object>}
     */
    static frames(sheet: any): Array<any>;
    /**
     * @method spriteConfig
     * @description Derives the uniform-grid sprite config (for Texture) from the
     * first frame and the sheet size.
     * @param {Object} sheet - Parsed Aseprite JSON
     * @returns {{frameWidth:number, frameHeight:number, framesPerRow:number, totalFrames:number}}
     */
    static spriteConfig(sheet: any): {
        frameWidth: number;
        frameHeight: number;
        framesPerRow: number;
        totalFrames: number;
    };
    /**
     * @method durations
     * @description Per-frame durations in milliseconds, in frame order.
     * @param {Object} sheet - Parsed Aseprite JSON
     * @returns {number[]}
     */
    static durations(sheet: any): number[];
    /** @private */
    private static _expandTag;
    /**
     * @method toClips
     * @description Builds clip descriptors from the sheet's frame tags. Each clip
     * is `{ name, frames, speed }` where `frames` are frame indices and `speed`
     * is the average frame duration (ms) — the per-clip speed the Animator uses.
     * If the sheet has no tags, a single "default" clip spanning all frames is
     * returned.
     * @param {Object} sheet - Parsed Aseprite JSON
     * @returns {Array<{name:string, frames:number[], speed:number}>}
     */
    static toClips(sheet: any): Array<{
        name: string;
        frames: number[];
        speed: number;
    }>;
    /**
     * @method applyTo
     * @description Registers every clip from the sheet on an Animator. Clips loop
     * by default; pass `loop` as a boolean (applies to all) or an object mapping
     * clip name -> boolean to override individual clips.
     * @param {Animator} animator - Target animator
     * @param {Object} sheet - Parsed Aseprite JSON
     * @param {Object} [options] - { loop = true }
     * @returns {Animator} - The animator (for chaining)
     */
    static applyTo(animator: Animator, sheet: any, options?: any): Animator;
}
