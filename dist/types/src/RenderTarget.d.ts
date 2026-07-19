export default RenderTarget;
/**
 * @class RenderTarget
 * @description An offscreen render surface: a framebuffer backed by a color
 * texture (and an optional depth buffer). Bind it to render the scene (or a
 * post-processing pass) into a texture instead of the screen. The resulting
 * `texture` can then be sampled by another pass or drawn to the canvas.
 *
 * Used by the post-processing pipeline, but also useful on its own for
 * minimaps, mirrors, render-to-texture effects, or picture-in-picture.
 *
 * @example
 * const rt = new RenderTarget(512, 512);
 * rt.bind();
 * // ...draw...
 * rt.unbind();
 * // rt.texture now holds the rendered image
 */
declare class RenderTarget {
    /**
     * @param {number} width - Width in pixels
     * @param {number} height - Height in pixels
     * @param {Object} [options] - { depth = false, pixelart = false }
     */
    constructor(width: number, height: number, options?: any);
    gl: WebGLRenderingContext;
    width: number;
    height: number;
    depth: boolean;
    pixelart: boolean;
    framebuffer: WebGLFramebuffer;
    texture: WebGLTexture;
    depthBuffer: WebGLRenderbuffer;
    /** @private */
    private _allocate;
    /**
     * @method resize
     * @description Resizes the surface (reallocating storage) if dimensions change.
     */
    resize(width: any, height: any): void;
    /**
     * @method bind
     * @description Binds this framebuffer and sets the viewport to its full size.
     */
    bind(): void;
    /**
     * @method unbind
     * @description Restores the default framebuffer (the canvas).
     */
    unbind(): void;
    /**
     * @method dispose
     * @description Frees all GL resources held by this target.
     */
    dispose(): void;
}
