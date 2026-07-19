export default Material;
/**
 * @class Material
 * @description A custom shader for a Drawable. By default it reuses the engine's
 * standard vertex shader (so transforms, the camera, and instancing keep
 * working) and only overrides the fragment program. Pass `options.vertex` to
 * also supply a custom VERTEX program — the escape hatch for effects the fixed
 * pipeline can't express (perspective tilt, vertex waves, billboarding, ...).
 *
 * The fragment shader always has: `vTexCoord`, `vFragPos`, `vInstanceColor`,
 * `uSampler`, `uColor`, `uOpacity`, `uTime`. A custom vertex shader gets
 * `aVertexPosition`, `aTextureCoord`, `uProjectionMatrix`, `uModelViewMatrix`,
 * `uTime`, and must write `vTexCoord` + `gl_Position`.
 *
 * Declare extra uniforms and set them via `set(name, value)`. A uniform value
 * may be a number, an array (vec2/3/4), or a FUNCTION — the function is called
 * each draw and receives the Drawable currently rendering, so a single shared
 * Material can read PER-OBJECT state (e.g. each card's own tilt angle).
 *
 * @example
 * // Per-object 3D tilt with one shared material:
 * const tilt = new Material(fragSrc, {
 *   vertex: tiltVertexSrc,
 *   uniforms: { uTiltX: (d) => d._tiltX || 0, uTiltY: (d) => d._tiltY || 0 },
 * });
 * cardA.setMaterial(tilt); cardB.setMaterial(tilt);
 * cardA.getComponent(Texture)._tiltX = 0.3; // each object animates independently
 */
declare class Material {
    /**
     * @param {string} fragmentSource - Fragment shader body (declares void main)
     * @param {Object} [options] - { vertex?: string, uniforms?: { name: value|function } }
     */
    constructor(fragmentSource: string, options?: any);
    gl: WebGLRenderingContext;
    /** @private */
    private _vertexSource;
    /** @private */
    private _fragmentSource;
    program: any;
    programInfo: {
        program: any;
        attribLocations: {
            vertexPosition: number;
            aTexCoord: number;
        };
        uniformLocations: {
            projectionMatrix: WebGLUniformLocation;
            globalViewMatrix: WebGLUniformLocation;
            useInstances: WebGLUniformLocation;
            uSampler: WebGLUniformLocation;
            color: WebGLUniformLocation;
            uOpacity: WebGLUniformLocation;
            uTime: WebGLUniformLocation;
        };
    };
    uniforms: any;
    /** @private */
    private _locCache;
    /**
     * @method _restoreGL
     * @description Recompiles the material's program and refreshes every cached
     * location after a WebGL context loss.
     * @private
     */
    private _restoreGL;
    /**
     * @method set
     * @description Sets (or schedules) a custom uniform value. Numbers, arrays
     * (vec2/3/4), and functions returning those are supported. A function uniform
     * receives the Drawable currently being rendered.
     * @param {string} name - Uniform name
     * @param {number|number[]|Function} value
     * @returns {Material} - this
     */
    set(name: string, value: number | number[] | Function): Material;
    /** @private */
    private _loc;
    /**
     * @method applyCustomUniforms
     * @description Uploads all user-declared uniforms. Called by Drawable each draw
     * after the program is bound. Inferred by value shape. Function uniforms are
     * called with the rendering Drawable so shared materials can read per-object data.
     * @param {Drawable} [drawable] - The drawable currently rendering
     */
    applyCustomUniforms(drawable?: Drawable): void;
}
