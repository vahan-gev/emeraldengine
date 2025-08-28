import { STANDARD_FRAGMENT_SHADER, STANDARD_VERTEX_SHADER } from "./Shaders.js";
import { initShaderProgram } from "./GLUtils.js";
import { mat4 } from "gl-matrix";
import Color from "./Color.js";
import Transform from "./Transform.js";
import { Vector2, Vector3 } from "./Physics.js";
import Time from "./Time.js";
import GLManager from "./managers/GLManager.js";
import CameraManager from "./managers/CameraManager.js";
import PointLight from "./lights/PointLight.js";
import DirectionalLight from "./lights/DirectionalLight.js";

/**
 * @class Emerald
 * @description A class that represents the Emerald engine
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
class Emerald {
  constructor(canvas) {
    const gl = canvas.getContext("webgl2", {
      antialias: true,
      powerPreference: "high-performance",
      desynchronized: false,
    });
    if (!gl) {
      console.error("[Emerald.js] > No WebGL context found");
      return undefined;
    }

    const shaderProgram = initShaderProgram(
      gl,
      STANDARD_VERTEX_SHADER,
      STANDARD_FRAGMENT_SHADER
    );
    this.shaderProgram = shaderProgram;
    this.gl = gl;
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        aTexCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        instanceMatrix: gl.getAttribLocation(shaderProgram, "aInstanceMatrix0"),
        instanceTexCoord0: gl.getAttribLocation(
          shaderProgram,
          "aInstanceTexCoord0"
        ),
        instanceTexCoord1: gl.getAttribLocation(
          shaderProgram,
          "aInstanceTexCoord1"
        ),
        instanceTexCoord2: gl.getAttribLocation(
          shaderProgram,
          "aInstanceTexCoord2"
        ),
        instanceTexCoord3: gl.getAttribLocation(
          shaderProgram,
          "aInstanceTexCoord3"
        ),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(
          shaderProgram,
          "uProjectionMatrix"
        ),
        globalViewMatrix: gl.getUniformLocation(
          shaderProgram,
          "uModelViewMatrix"
        ),
        instancedModelViewMatrix: gl.getUniformLocation(
          shaderProgram,
          "uInstancedModelViewMatrix"
        ),
        uModelMatrix: gl.getUniformLocation(shaderProgram, "uModelMatrix"),
        uInstancedModelMatrix: gl.getUniformLocation(
          shaderProgram,
          "uInstancedModelMatrix"
        ),
        uAmbientLightValues: gl.getUniformLocation(
          shaderProgram,
          "uAmbientLightValues"
        ),
        uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
        color: gl.getUniformLocation(shaderProgram, "uColor"),
        useTexture: gl.getUniformLocation(shaderProgram, "useTexture"),
        useInstances: gl.getUniformLocation(shaderProgram, "useInstances"),
        useText: gl.getUniformLocation(shaderProgram, "useText"),
        useLighting: gl.getUniformLocation(shaderProgram, "uUseLighting"),
        uOpacity: gl.getUniformLocation(shaderProgram, "uOpacity"),
        // Point light uniforms
        uLightPosition: gl.getUniformLocation(shaderProgram, "uLightPosition"),
        uLightColor: gl.getUniformLocation(shaderProgram, "uLightColor"),
        uLightIntensity: gl.getUniformLocation(
          shaderProgram,
          "uLightIntensity"
        ),
        uLightRadius: gl.getUniformLocation(shaderProgram, "uLightRadius"),
        uActiveLights: gl.getUniformLocation(shaderProgram, "uActiveLights"),
        // Directional light uniforms
        uDirLightPosition: gl.getUniformLocation(
          shaderProgram,
          "uDirLightPosition"
        ),
        uDirLightDirection: gl.getUniformLocation(
          shaderProgram,
          "uDirLightDirection"
        ),
        uDirLightColor: gl.getUniformLocation(shaderProgram, "uDirLightColor"),
        uDirLightIntensity: gl.getUniformLocation(
          shaderProgram,
          "uDirLightIntensity"
        ),
        uDirLightWidth: gl.getUniformLocation(shaderProgram, "uDirLightWidth"),
        uActiveDirLights: gl.getUniformLocation(
          shaderProgram,
          "uActiveDirLights"
        ),
      },
    };
    GLManager.setGL(gl);
    GLManager.setProgramInfo(this.programInfo);
    this.camera = {
      transform: new Transform(new Vector3(0, 0, 0), 0, new Vector2(1, 1)),
      setPosition(x, y, z) {
        this.transform.position.x = -x;
        this.transform.position.y = -y;
        this.transform.position.z = -z;
      },
    };

    CameraManager.setCamera(this.camera);

    this.ambientLight = new Vector3(1.0, 1.0, 1.0);
    this.pointLights = [];
    this.directionalLights = [];
    this.debugLogged = false; // Flag to prevent spam in console
    this.backgroundColor = {
      r: 0.0,
      g: 0.0,
      b: 0.0,
      a: 1.0,
    };
  }

  /**
   * @method setAmbientLight
   * @description Sets the ambient light for the scene
   * @param {Vector3} vector3 - The ambient light color as a Vector3 instance
   */
  setAmbientLight(vector3) {
    if (vector3.x && vector3.y && vector3.z) {
      this.ambientLight = vector3;
    } else {
      console.error(
        "[Emerald.js] > vector3 is not an instance of Vector3 class."
      );
    }
  }

  /**
   * @method resize
   * @description Resizes the canvas
   * @param {number} width - The width of the canvas
   * @param {number} height - The height of the canvas
   */
  resize(width, height) {
    // Update canvas dimensions
    this.gl.canvas.width = width;
    this.gl.canvas.height = height;

    // Update WebGL viewport
    this.gl.viewport(0, 0, width, height);
  }

  /**
   * @method addPointLight
   * @description Adds a point light to the scene
   * @param {PointLight} pointLight - The point light to add
   */
  addPointLight(pointLight) {
    if (!(pointLight instanceof PointLight)) {
      console.error(
        "[Emerald.js] > Passed argument is not an instance of PointLight class."
      );
      return;
    }
    if (this.pointLights.length < 4) {
      // Maximum 4 lights as defined in shader
      this.pointLights.push(pointLight);
    } else {
      console.warn("Maximum number of point lights reached (4)");
    }
  }

  /**
   * @method addDirectionalLight
   * @description Adds a directional light to the scene
   * @param {DirectionalLight} directionalLight - The directional light to add
   */
  addDirectionalLight(directionalLight) {
    if (!(directionalLight instanceof DirectionalLight)) {
      console.error(
        "[Emerald.js] > Passed argument is not an instance of DirectionalLight class."
      );
      return;
    }
    if (this.directionalLights.length < 4) {
      // Maximum 4 directional lights as defined in shader
      this.directionalLights.push(directionalLight);
    } else {
      console.warn("Maximum number of directional lights reached (4)");
    }
  }

  /**
   * @method removeDirectionalLight
   * @description Removes a directional light from the scene
   * @param {DirectionalLight} directionalLight - The directional light to remove
   */
  removeDirectionalLight(directionalLight) {
    const index = this.directionalLights.indexOf(directionalLight);
    if (index > -1) {
      this.directionalLights.splice(index, 1);
    }
  }

  /**
   * @method setBackgroundColor
   * @description Sets the background color of the scene
   * @param {Color} color - The background color
   */
  setBackgroundColor(color) {
    if (color instanceof Color) {
      this.backgroundColor = {
        r: color.r / 255,
        g: color.g / 255,
        b: color.b / 255,
        a: color.a / 255,
      };
    } else {
      console.error("[Emerald.js] > color is not an instance of Color class.");
    }
  }
  // Buggy (events don't work correctly when zoom changes from 1)
  // setZoom(float) {
  //   vec3.set(this.camera.scale, float, float, float);
  // }

  // getZoom() {
  //   return this.camera.scale[0];
  // }

  /**
   * @method drawScene
   * @description Draws the scene
   * @param {Scene} scene - The scene to draw
   * @param {number} deltaTime - The delta time
   */
  drawScene(scene, deltaTime) {
    Time.setDeltaTime(deltaTime);
    if (this.backgroundColor) {
      this.gl.clearColor(
        this.backgroundColor.r,
        this.backgroundColor.g,
        this.backgroundColor.b,
        this.backgroundColor.a
      );
    } else {
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Default to black if no background color is set
    }
    // 2D rendering: disable depth testing to allow proper alpha blending with back-to-front draw order
    this.gl.clearDepth(1.0);
    this.gl.disable(this.gl.DEPTH_TEST);

    this.gl.enable(this.gl.BLEND);
    // Keep framebuffer alpha at 1.0 to avoid page compositing artifacts while blending RGB correctly
    // newRGB = srcRGB * srcA + dstRGB * (1 - srcA)
    // newA   = 1 * srcA   + (1 - srcA) * 1 = 1
    this.gl.blendFuncSeparate(
      this.gl.SRC_ALPHA,
      this.gl.ONE_MINUS_SRC_ALPHA,
      this.gl.ONE,
      this.gl.ONE_MINUS_SRC_ALPHA
    );
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const projectionMatrix = mat4.create();
    const left = -this.gl.canvas.clientWidth / 2;
    const right = this.gl.canvas.clientWidth / 2;
    const bottom = -this.gl.canvas.clientHeight / 2;
    const top = this.gl.canvas.clientHeight / 2;
    const near = -100;
    const far = 100;
    mat4.ortho(projectionMatrix, left, right, bottom, top, near, far);

    const globalViewMatrix = mat4.create();
    mat4.translate(globalViewMatrix, globalViewMatrix, [
      this.camera.transform.position.x,
      this.camera.transform.position.y,
      this.camera.transform.position.z,
    ]); // Translation
    mat4.rotate(globalViewMatrix, globalViewMatrix, 0, [1, 0, 0]); // X-axis rotation
    mat4.rotate(globalViewMatrix, globalViewMatrix, 0, [0, 1, 0]); // Y-axis rotation
    mat4.rotate(
      globalViewMatrix,
      globalViewMatrix,
      this.camera.transform.rotation,
      [0, 0, 1]
    ); // Z-axis rotation
    mat4.scale(globalViewMatrix, globalViewMatrix, [
      this.camera.transform.scale.x,
      this.camera.transform.scale.y,
      1,
    ]); // Scale

    this.gl.useProgram(this.programInfo.program);

    this.gl.uniform3fv(
      this.programInfo.uniformLocations.uAmbientLightValues,
      new Float32Array([
        this.ambientLight.x,
        this.ambientLight.y,
        this.ambientLight.z,
      ])
    );
    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );
    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.globalViewMatrix,
      false,
      globalViewMatrix
    );

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.instancedModelViewMatrix,
      false,
      globalViewMatrix
    );

    const lightPositions = [];
    const lightColors = [];
    const lightIntensities = [];
    const lightRadii = [];

    this.pointLights.forEach((light) => {
      // Get original world position
      const worldPos = new Vector2(light.position.x, light.position.y);

      // This transforms the world position to account for camera movement
      const adjustedPos = new Vector2(
        worldPos.x + this.camera.transform.position.x,
        worldPos.y + this.camera.transform.position.y
      );

      // Push the adjusted position to the array
      lightPositions.push(adjustedPos.x, adjustedPos.y);
      lightColors.push(
        light.color.r / 255,
        light.color.g / 255,
        light.color.b / 255
      );
      lightIntensities.push(light.intensity);
      lightRadii.push(light.radius);
    });

    // Get uniform locations
    const uLightPositionLoc = this.programInfo.uniformLocations.uLightPosition;
    const uLightColorLoc = this.programInfo.uniformLocations.uLightColor;
    const uLightIntensityLoc =
      this.programInfo.uniformLocations.uLightIntensity;
    const uLightRadiusLoc = this.programInfo.uniformLocations.uLightRadius;
    const uActiveLightsLoc = this.programInfo.uniformLocations.uActiveLights;

    // Set uniform values
    if (lightPositions.length > 0) {
      this.gl.uniform2fv(uLightPositionLoc, new Float32Array(lightPositions));
      this.gl.uniform3fv(uLightColorLoc, new Float32Array(lightColors));
      this.gl.uniform1fv(
        uLightIntensityLoc,
        new Float32Array(lightIntensities)
      );
      this.gl.uniform1fv(uLightRadiusLoc, new Float32Array(lightRadii));
    }
    this.gl.uniform1i(uActiveLightsLoc, this.pointLights.length);

    // Prepare directional light data
    const dirLightPositions = [];
    const dirLightDirections = [];
    const dirLightColors = [];
    const dirLightIntensities = [];
    const dirLightWidths = [];

    this.directionalLights.forEach((light) => {
      // Apply camera transformation to directional light position
      const worldPos = new Vector2(light.position.x, light.position.y);
      const adjustedPos = new Vector2(
        worldPos.x + this.camera.transform.position.x,
        worldPos.y + this.camera.transform.position.y
      );

      dirLightPositions.push(adjustedPos.x, adjustedPos.y);
      dirLightDirections.push(light.direction.x, light.direction.y);
      dirLightColors.push(
        light.color.r / 255,
        light.color.g / 255,
        light.color.b / 255
      );
      dirLightIntensities.push(light.intensity);
      dirLightWidths.push(light.width);
    });

    // Get directional light uniform locations
    const uDirLightPositionLoc =
      this.programInfo.uniformLocations.uDirLightPosition;
    const uDirLightDirectionLoc =
      this.programInfo.uniformLocations.uDirLightDirection;
    const uDirLightColorLoc = this.programInfo.uniformLocations.uDirLightColor;
    const uDirLightIntensityLoc =
      this.programInfo.uniformLocations.uDirLightIntensity;
    const uDirLightWidthLoc = this.programInfo.uniformLocations.uDirLightWidth;
    const uActiveDirLightsLoc =
      this.programInfo.uniformLocations.uActiveDirLights;

    // Set directional light uniform values
    if (dirLightPositions.length > 0) {
      this.gl.uniform2fv(
        uDirLightPositionLoc,
        new Float32Array(dirLightPositions)
      );
      this.gl.uniform2fv(
        uDirLightDirectionLoc,
        new Float32Array(dirLightDirections)
      );
      this.gl.uniform3fv(uDirLightColorLoc, new Float32Array(dirLightColors));
      this.gl.uniform1fv(
        uDirLightIntensityLoc,
        new Float32Array(dirLightIntensities)
      );
      this.gl.uniform1fv(uDirLightWidthLoc, new Float32Array(dirLightWidths));
    }
    this.gl.uniform1i(uActiveDirLightsLoc, this.directionalLights.length);

    // Draw objects back-to-front based on their z to ensure correct transparency blending
    const sortedObjects = [...scene.objects].sort(
      (a, b) => a.transform.position.z - b.transform.position.z
    );
    for (const object of sortedObjects) {
      object.draw(
        globalViewMatrix,
        this.programInfo.uniformLocations.globalViewMatrix,
        performance.now()
      );
    }
  }
}

export default Emerald;
