export default SpriteBatch;
/**
 * @class SpriteBatch
 * @description A dynamic batched sprite renderer. Instead of one draw call per
 * sprite (as ordinary Drawables incur), it accumulates many sprites that share a
 * texture into a single interleaved buffer and submits them in one
 * `drawElements` call. Batches are flushed automatically when the texture
 * changes or the buffer fills, so for content that shares a texture/atlas this
 * collapses hundreds of draw calls into a handful.
 *
 * It uses its own minimal shader program (position + uv + per-vertex color), so
 * it is independent of the main render pipeline.
 *
 * @example
 * const batch = new SpriteBatch();
 * batch.begin(projectionMatrix, viewMatrix); // gl-matrix mat4s
 * for (const e of entities) {
 *   batch.draw({ texture: atlasTex, x: e.x, y: e.y, w: 32, h: 32,
 *                u0: e.u0, v0: e.v0, u1: e.u1, v1: e.v1 });
 * }
 * batch.end();
 */
declare class SpriteBatch {
    /**
     * @method _writeQuad
     * @description Pure helper that writes one quad's 4 interleaved vertices
     * (position, uv, color) into `out` at `offset`. Positions are rotated around
     * the quad center (cx, cy). Exposed (and side-effect free) for testing.
     * @private
     */
    private static _writeQuad;
    /**
     * @param {Object} [options] - { maxQuads = 2000 }
     */
    constructor(options?: any);
    gl: WebGLRenderingContext;
    maxQuads: any;
    program: any;
    attribs: {
        pos: number;
        uv: number;
        color: number;
    };
    uniforms: {
        projection: WebGLUniformLocation;
        view: WebGLUniformLocation;
        sampler: WebGLUniformLocation;
    };
    vertexData: Float32Array<ArrayBuffer>;
    vertexBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    /** @private */
    private _quadCount;
    /** @private */
    private _currentTexture;
    /** @private */
    private _projection;
    /** @private */
    private _view;
    drawCalls: number;
    /**
     * @method begin
     * @description Starts a batch with the given projection and view matrices
     * (gl-matrix mat4 / Float32Array(16)).
     */
    begin(projectionMatrix: any, viewMatrix: any): void;
    /**
     * @method draw
     * @description Queues one sprite. Flushes first if the texture changed or the
     * batch is full.
     * @param {Object} sprite - {
     *   texture, x, y, w, h,
     *   rotation = 0, originX = 0.5, originY = 0.5,
     *   u0 = 0, v0 = 0, u1 = 1, v1 = 1,
     *   r = 1, g = 1, b = 1, a = 1
     * }
     */
    draw(sprite: any): void;
    /**
     * @method end
     * @description Flushes any remaining sprites.
     */
    end(): void;
    /**
     * @method flush
     * @description Uploads and draws the currently staged quads.
     */
    flush(): void;
}
