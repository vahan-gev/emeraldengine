import { PostEffect } from "./PostProcessor.js";

/**
 * @class BloomEffect
 * @description Multi-pass bloom: extract bright pixels above a threshold, blur
 * them with a separable Gaussian, then add the result back over the scene. Built
 * via {@link PostEffects.bloom}.
 */
class BloomEffect extends PostEffect {
  constructor(options = {}) {
    super("bloom", `void main(){ gl_FragColor = texture2D(uScene, vUV); }`);
    this.threshold = options.threshold ?? 0.7;
    this.intensity = options.intensity ?? 1.0;
    this.spread = options.spread ?? 1.0;

    /** @private */
    this._threshold = new PostEffect(
      "bloom:threshold",
      `
      uniform float uThreshold;
      void main() {
        vec4 c = texture2D(uScene, vUV);
        float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
        gl_FragColor = l > uThreshold ? c : vec4(0.0, 0.0, 0.0, 1.0);
      }`,
      { setUniforms: (gl, loc) => gl.uniform1f(loc("uThreshold"), this.threshold) }
    );

    const blur = (horizontal) => `
      uniform float uSpread;
      void main() {
        vec2 texel = (${horizontal ? "vec2(1.0, 0.0)" : "vec2(0.0, 1.0)"}) / uResolution * uSpread;
        float w[5];
        w[0] = 0.227027; w[1] = 0.1945946; w[2] = 0.1216216; w[3] = 0.054054; w[4] = 0.016216;
        vec3 result = texture2D(uScene, vUV).rgb * w[0];
        for (int i = 1; i < 5; i++) {
          result += texture2D(uScene, vUV + texel * float(i)).rgb * w[i];
          result += texture2D(uScene, vUV - texel * float(i)).rgb * w[i];
        }
        gl_FragColor = vec4(result, 1.0);
      }`;
    const blurUniforms = {
      setUniforms: (gl, loc) => gl.uniform1f(loc("uSpread"), this.spread),
    };
    /** @private */
    this._blurH = new PostEffect("bloom:blurH", blur(true), blurUniforms);
    /** @private */
    this._blurV = new PostEffect("bloom:blurV", blur(false), blurUniforms);

    /** @private */
    this._composite = new PostEffect(
      "bloom:composite",
      `
      uniform sampler2D uBloom;
      uniform float uIntensity;
      void main() {
        vec4 scene = texture2D(uScene, vUV);
        vec3 bloom = texture2D(uBloom, vUV).rgb;
        gl_FragColor = vec4(scene.rgb + bloom * uIntensity, scene.a);
      }`,
      {
        setUniforms: (gl, loc) => {
          gl.uniform1f(loc("uIntensity"), this.intensity);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, this._bloomTex);
          gl.uniform1i(loc("uBloom"), 1);
          gl.activeTexture(gl.TEXTURE0);
        },
      }
    );
  }

  /** @private */
  _compile(gl) {
    super._compile(gl);
    this._threshold._compile(gl);
    this._blurH._compile(gl);
    this._blurV._compile(gl);
    this._composite._compile(gl);
  }

  render(ctx) {
    const temp0 = ctx.acquireTemp(0);
    const temp1 = ctx.acquireTemp(1);
    ctx.blit(this._threshold, ctx.input, temp0);
    ctx.blit(this._blurH, temp0.texture, temp1);
    ctx.blit(this._blurV, temp1.texture, temp0);
    /** @private */
    this._bloomTex = temp0.texture;
    ctx.blit(this._composite, ctx.input, ctx.output);
  }
}

/**
 * @namespace PostEffects
 * @description Factory functions for the built-in post-processing effects. Pass
 * the returned PostEffect to `emerald.addPostEffect(...)`.
 *
 * @example
 * emerald.enablePostProcessing();
 * emerald.addPostEffect(PostEffects.bloom({ threshold: 0.6, intensity: 1.2 }));
 * emerald.addPostEffect(PostEffects.vignette({ intensity: 0.5 }));
 * emerald.addPostEffect(PostEffects.crt());
 */
const PostEffects = {
  /**
   * @method grayscale
   * @description Desaturates the image.
   */
  grayscale() {
    return new PostEffect(
      "grayscale",
      `void main() {
        vec4 c = texture2D(uScene, vUV);
        float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor = vec4(vec3(l), c.a);
      }`
    );
  },

  /**
   * @method vignette
   * @description Darkens the edges of the screen.
   * @param {Object} [options] - { intensity = 0.5, radius = 0.75, softness = 0.45 }
   */
  vignette(options = {}) {
    const intensity = options.intensity ?? 0.5;
    const radius = options.radius ?? 0.75;
    const softness = options.softness ?? 0.45;
    return new PostEffect(
      "vignette",
      `
      uniform float uIntensity;
      uniform float uRadius;
      uniform float uSoftness;
      void main() {
        vec4 c = texture2D(uScene, vUV);
        float d = distance(vUV, vec2(0.5));
        float v = smoothstep(uRadius, uRadius - uSoftness, d);
        c.rgb *= mix(1.0 - uIntensity, 1.0, v);
        gl_FragColor = c;
      }`,
      {
        setUniforms: (gl, loc) => {
          gl.uniform1f(loc("uIntensity"), intensity);
          gl.uniform1f(loc("uRadius"), radius);
          gl.uniform1f(loc("uSoftness"), softness);
        },
      }
    );
  },

  /**
   * @method colorGrade
   * @description Adjusts brightness, contrast and saturation.
   * @param {Object} [options] - { brightness = 0, contrast = 1, saturation = 1 }
   */
  colorGrade(options = {}) {
    const brightness = options.brightness ?? 0;
    const contrast = options.contrast ?? 1;
    const saturation = options.saturation ?? 1;
    return new PostEffect(
      "colorGrade",
      `
      uniform float uBrightness;
      uniform float uContrast;
      uniform float uSaturation;
      void main() {
        vec4 c = texture2D(uScene, vUV);
        vec3 col = c.rgb + uBrightness;
        col = (col - 0.5) * uContrast + 0.5;
        float l = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(l), col, uSaturation);
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a);
      }`,
      {
        setUniforms: (gl, loc) => {
          gl.uniform1f(loc("uBrightness"), brightness);
          gl.uniform1f(loc("uContrast"), contrast);
          gl.uniform1f(loc("uSaturation"), saturation);
        },
      }
    );
  },

  /**
   * @method chromaticAberration
   * @description Splits the RGB channels toward the screen edges.
   * @param {Object} [options] - { amount = 0.003 }
   */
  chromaticAberration(options = {}) {
    const amount = options.amount ?? 0.003;
    return new PostEffect(
      "chromaticAberration",
      `
      uniform float uAmount;
      void main() {
        vec2 dir = vUV - 0.5;
        vec2 off = dir * uAmount;
        float r = texture2D(uScene, vUV + off).r;
        float g = texture2D(uScene, vUV).g;
        float b = texture2D(uScene, vUV - off).b;
        float a = texture2D(uScene, vUV).a;
        gl_FragColor = vec4(r, g, b, a);
      }`,
      { setUniforms: (gl, loc) => gl.uniform1f(loc("uAmount"), amount) }
    );
  },

  /**
   * @method scanlines
   * @description Overlays horizontal scanlines.
   * @param {Object} [options] - { intensity = 0.15, count = 480 }
   */
  scanlines(options = {}) {
    const intensity = options.intensity ?? 0.15;
    const count = options.count ?? 480;
    return new PostEffect(
      "scanlines",
      `
      uniform float uIntensity;
      uniform float uCount;
      void main() {
        vec4 c = texture2D(uScene, vUV);
        float s = sin(vUV.y * uCount * 3.14159265);
        c.rgb *= 1.0 - uIntensity * (0.5 + 0.5 * s) ;
        gl_FragColor = c;
      }`,
      {
        setUniforms: (gl, loc) => {
          gl.uniform1f(loc("uIntensity"), intensity);
          gl.uniform1f(loc("uCount"), count);
        },
      }
    );
  },

  /**
   * @method crt
   * @description Retro CRT look: barrel distortion, scanlines and edge vignette.
   * @param {Object} [options] - { curvature = 4.0, scanlineIntensity = 0.2, vignette = 0.3 }
   */
  crt(options = {}) {
    const curvature = options.curvature ?? 4.0;
    const scanlineIntensity = options.scanlineIntensity ?? 0.2;
    const vignette = options.vignette ?? 0.3;
    return new PostEffect(
      "crt",
      `
      uniform float uCurvature;
      uniform float uScanline;
      uniform float uVignette;
      vec2 curve(vec2 uv) {
        uv = uv * 2.0 - 1.0;
        vec2 offset = abs(uv.yx) / uCurvature;
        uv = uv + uv * offset * offset;
        return uv * 0.5 + 0.5;
      }
      void main() {
        vec2 uv = curve(vUV);
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          return;
        }
        vec4 c = texture2D(uScene, uv);
        float scan = sin(uv.y * uResolution.y * 3.14159265);
        c.rgb *= 1.0 - uScanline * (0.5 + 0.5 * scan);
        float d = distance(uv, vec2(0.5));
        c.rgb *= 1.0 - uVignette * d * d * 2.0;
        gl_FragColor = c;
      }`,
      {
        setUniforms: (gl, loc) => {
          gl.uniform1f(loc("uCurvature"), curvature);
          gl.uniform1f(loc("uScanline"), scanlineIntensity);
          gl.uniform1f(loc("uVignette"), vignette);
        },
      }
    );
  },

  /**
   * @method bloom
   * @description Glow around bright areas (multi-pass).
   * @param {Object} [options] - { threshold = 0.7, intensity = 1.0, spread = 1.0 }
   */
  bloom(options = {}) {
    return new BloomEffect(options);
  },
};

export default PostEffects;
export { BloomEffect };
