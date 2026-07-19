export default PostProcessor;
/**
 * @class PostProcessor
 * @description Drives a chain of full-screen {@link PostEffect}s. The scene is
 * rendered into a texture, then each effect is applied in sequence (ping-ponging
 * between two render targets), and the final result is drawn to the screen.
 *
 * Created and managed by Emerald when you call `emerald.enablePostProcessing()`;
 * you usually just add effects via `emerald.addPostEffect(PostEffects.bloom())`.
 */
declare class PostProcessor {
    gl: WebGLRenderingContext;
    effects: any[];
    enabled: boolean;
    /** @private */
    private _quad;
    /** @private */
    private _rtA;
    /** @private */
    private _rtB;
    /** @private */
    private _temps;
    /** @private */
    private _width;
    /** @private */
    private _height;
    /**
     * @method _restoreGL
     * @description Rebuilds the fullscreen quad, ping-pong render targets, and
     * every effect's program after a WebGL context loss.
     * @private
     */
    private _restoreGL;
    /**
     * @method addEffect
     * @description Appends an effect to the chain.
     * @param {PostEffect} effect
     * @returns {PostProcessor} - this
     */
    addEffect(effect: PostEffect): PostProcessor;
    /**
     * @method removeEffect
     * @description Removes an effect from the chain.
     */
    removeEffect(effect: any): this;
    /**
     * @method clear
     * @description Removes all effects.
     */
    clear(): this;
    /**
     * @method hasEffects
     * @returns {boolean} - Whether any enabled effects exist.
     */
    hasEffects(): boolean;
    /** @private */
    private _acquireTemp;
    /**
     * @method process
     * @description Applies the effect chain, drawing the final image to the canvas.
     * @param {WebGLTexture} sceneTexture - The rendered scene
     * @param {number} width - Canvas width in pixels
     * @param {number} height - Canvas height in pixels
     * @param {number} time - Seconds (for time-based effects)
     */
    process(sceneTexture: WebGLTexture, width: number, height: number, time: number): void;
    /**
     * @method _blit
     * @description Renders one effect program from `input` into `output` (null =
     * screen), setting the standard uniforms.
     * @private
     */
    private _blit;
    /**
     * @method dispose
     * @description Frees the render targets owned by this processor.
     */
    dispose(): void;
}
/**
 * @class PostEffect
 * @description A single full-screen post-processing pass: a fragment shader that
 * samples the previous pass (`uScene`) and writes the next image. The shader
 * automatically has `vUV`, `uScene`, `uResolution`, and `uTime` available; add
 * your own uniforms and set them with the `setUniforms` callback.
 *
 * @example
 * const tint = new PostEffect("tint", `
 *   uniform vec3 uTint;
 *   void main() { gl_FragColor = texture2D(uScene, vUV) * vec4(uTint, 1.0); }
 * `, { setUniforms: (gl, loc) => gl.uniform3f(loc("uTint"), 1.0, 0.8, 0.8) });
 */
export class PostEffect {
    /**
     * @param {string} name - A label (for debugging)
     * @param {string} fragmentSource - Fragment shader body (declares void main)
     * @param {Object} [options] - { setUniforms(gl, loc, ctx), enabled = true }
     */
    constructor(name: string, fragmentSource: string, options?: any);
    name: string;
    fragmentSource: string;
    setUniforms: any;
    enabled: boolean;
    program: any;
    /** @private */
    private _locCache;
    /** @private */
    private _compile;
    /**
     * @method _restoreGL
     * @description Drops the dead program/locations after a context loss so the
     * next _compile builds fresh ones.
     * @private
     */
    private _restoreGL;
    loc(gl: any, name: any): any;
    /**
     * @method render
     * @description Renders this effect from ctx.input into ctx.output. Override for
     * multi-pass effects.
     * @param {Object} ctx - Provided by the PostProcessor
     */
    render(ctx: any): void;
}
