/**
 * @class GLState
 * @description Tiny redundant-uniform filter. The renderer sets the same handful
 * of per-object uniforms (useTexture, useInstances, useLighting, color, opacity)
 * for every object every frame; most calls repeat the previous value. These
 * helpers skip the GL call when the value is unchanged. Keyed by uniform
 * location, which is program-specific, so the cache is safe across objects.
 */
class GLState {
  /**
   * @method reset
   * @description Clears the cache. Called at the start of each frame so the
   * first object always re-establishes state.
   */
  static reset() {
    GLState.ints.clear();
    GLState.floats.clear();
    GLState.vec4s.clear();
  }

  /**
   * @method uniform1i
   * @description Cached gl.uniform1i (accepts booleans, coerced like WebGL does).
   */
  static uniform1i(gl, location, value) {
    if (location == null) return;
    const v = value === true ? 1 : value === false ? 0 : value;
    if (GLState.ints.get(location) !== v) {
      gl.uniform1i(location, v);
      GLState.ints.set(location, v);
    }
  }

  /**
   * @method uniform1f
   * @description Cached gl.uniform1f.
   */
  static uniform1f(gl, location, value) {
    if (location == null) return;
    if (GLState.floats.get(location) !== value) {
      gl.uniform1f(location, value);
      GLState.floats.set(location, value);
    }
  }

  /**
   * @method uniform4fv
   * @description Cached gl.uniform4fv (compares the four components).
   */
  static uniform4fv(gl, location, value) {
    if (location == null) return;
    const cached = GLState.vec4s.get(location);
    if (
      !cached ||
      cached[0] !== value[0] ||
      cached[1] !== value[1] ||
      cached[2] !== value[2] ||
      cached[3] !== value[3]
    ) {
      gl.uniform4fv(location, value);
      GLState.vec4s.set(location, [value[0], value[1], value[2], value[3]]);
    }
  }
}

GLState.ints = new Map();
GLState.floats = new Map();
GLState.vec4s = new Map();

export default GLState;
