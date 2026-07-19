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
class Aseprite {
  /**
   * @method frames
   * @description Returns the frames as an ordered array regardless of whether
   * the export used the Hash (object) or Array layout.
   * @param {Object} sheet - Parsed Aseprite JSON
   * @returns {Array<Object>}
   */
  static frames(sheet) {
    const f = sheet.frames;
    if (Array.isArray(f)) return f;
    return f ? Object.values(f) : [];
  }

  /**
   * @method spriteConfig
   * @description Derives the uniform-grid sprite config (for Texture) from the
   * first frame and the sheet size.
   * @param {Object} sheet - Parsed Aseprite JSON
   * @returns {{frameWidth:number, frameHeight:number, framesPerRow:number, totalFrames:number}}
   */
  static spriteConfig(sheet) {
    const frames = Aseprite.frames(sheet);
    const first = frames[0] && frames[0].frame ? frames[0].frame : { w: 0, h: 0 };
    const frameWidth = first.w || 0;
    const frameHeight = first.h || 0;
    const sheetW = (sheet.meta && sheet.meta.size && sheet.meta.size.w) || frameWidth;
    return {
      frameWidth,
      frameHeight,
      framesPerRow: frameWidth ? Math.max(1, Math.round(sheetW / frameWidth)) : 1,
      totalFrames: frames.length,
    };
  }

  /**
   * @method durations
   * @description Per-frame durations in milliseconds, in frame order.
   * @param {Object} sheet - Parsed Aseprite JSON
   * @returns {number[]}
   */
  static durations(sheet) {
    return Aseprite.frames(sheet).map((f) => f.duration || 100);
  }

  /** @private */
  static _expandTag(tag) {
    const from = tag.from;
    const to = tag.to;
    const forward = [];
    for (let i = from; i <= to; i++) forward.push(i);
    const dir = (tag.direction || "forward").toLowerCase();
    if (dir === "reverse") return forward.slice().reverse();
    if (dir === "pingpong" || dir === "ping-pong") {
      const back = forward.slice(1, -1).reverse();
      return forward.concat(back);
    }
    return forward;
  }

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
  static toClips(sheet) {
    const durations = Aseprite.durations(sheet);
    const avg = (indices) => {
      if (!indices.length) return 100;
      let sum = 0;
      let n = 0;
      for (const i of indices) {
        sum += durations[i] != null ? durations[i] : 100;
        n++;
      }
      return Math.round(sum / n);
    };

    const tags = (sheet.meta && sheet.meta.frameTags) || [];
    if (!tags.length) {
      const all = durations.map((_, i) => i);
      return [{ name: "default", frames: all, speed: avg(all) }];
    }
    return tags.map((tag) => {
      const frames = Aseprite._expandTag(tag);
      return { name: tag.name, frames, speed: avg(frames) };
    });
  }

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
  static applyTo(animator, sheet, options = {}) {
    const loopOpt = options.loop ?? true;
    for (const clip of Aseprite.toClips(sheet)) {
      const loop =
        typeof loopOpt === "object" && loopOpt !== null
          ? loopOpt[clip.name] ?? true
          : !!loopOpt;
      animator.addClip(clip.name, clip.frames, { speed: clip.speed, loop });
    }
    return animator;
  }
}

export default Aseprite;
