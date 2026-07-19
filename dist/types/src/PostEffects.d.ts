export default PostEffects;
declare namespace PostEffects {
    /**
     * @method grayscale
     * @description Desaturates the image.
     */
    function grayscale(): PostEffect;
    /**
     * @method vignette
     * @description Darkens the edges of the screen.
     * @param {Object} [options] - { intensity = 0.5, radius = 0.75, softness = 0.45 }
     */
    function vignette(options?: any): PostEffect;
    /**
     * @method colorGrade
     * @description Adjusts brightness, contrast and saturation.
     * @param {Object} [options] - { brightness = 0, contrast = 1, saturation = 1 }
     */
    function colorGrade(options?: any): PostEffect;
    /**
     * @method chromaticAberration
     * @description Splits the RGB channels toward the screen edges.
     * @param {Object} [options] - { amount = 0.003 }
     */
    function chromaticAberration(options?: any): PostEffect;
    /**
     * @method scanlines
     * @description Overlays horizontal scanlines.
     * @param {Object} [options] - { intensity = 0.15, count = 480 }
     */
    function scanlines(options?: any): PostEffect;
    /**
     * @method crt
     * @description Retro CRT look: barrel distortion, scanlines and edge vignette.
     * @param {Object} [options] - { curvature = 4.0, scanlineIntensity = 0.2, vignette = 0.3 }
     */
    function crt(options?: any): PostEffect;
    /**
     * @method bloom
     * @description Glow around bright areas (multi-pass).
     * @param {Object} [options] - { threshold = 0.7, intensity = 1.0, spread = 1.0 }
     */
    function bloom(options?: any): BloomEffect;
}
/**
 * @class BloomEffect
 * @description Multi-pass bloom: extract bright pixels above a threshold, blur
 * them with a separable Gaussian, then add the result back over the scene. Built
 * via {@link PostEffects.bloom}.
 */
export class BloomEffect extends PostEffect {
    constructor(options?: {});
    threshold: any;
    intensity: any;
    spread: any;
    /** @private */
    private _threshold;
    /** @private */
    private _blurH;
    /** @private */
    private _blurV;
    /** @private */
    private _composite;
    render(ctx: any): void;
    /** @private */
    private _bloomTex;
}
import { PostEffect } from "./PostProcessor.js";
