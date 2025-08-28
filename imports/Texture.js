import { initVertexBuffer } from "./GLUtils.js";
import Drawable from "./Drawable.js";
import GLManager from "./managers/GLManager.js";

/**
 * @class Texture
 * @description Represents a texture component
 * @param {string} texturePath - The path to the texture
 * @param {number} frameWidth - The width of the frame
 * @param {number} frameHeight - The height of the frame
 * @param {number} framesPerRow - The number of frames per row
 * @param {number} totalFrames - The total number of frames
 * @param {number} animationSpeed - The speed of the animation
 * @param {boolean} autoPlay - Whether the animation should play automatically
 * @param {boolean} pixelart - Whether the texture is a pixel art texture
 * @param {boolean} useLighting - Whether the texture should react to lighting
 */
class Texture extends Drawable {
  constructor(
    texturePath = {},
    frameWidth = 0,
    frameHeight = 0,
    framesPerRow = 1,
    totalFrames = 1,
    animationSpeed = 1000,
    autoPlay = true,
    pixelart = true,
    useLighting = true
  ) {
    const vertices = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    const verticesBuffer = initVertexBuffer(GLManager.getGL(), vertices);
    const textureCoordinates = [
      1.0,
      1.0, // Top-right
      0.0,
      1.0, // Top-left
      1.0,
      0.0, // Bottom-right
      0.0,
      0.0, // Bottom-left
    ];
    const texCoordBuffer = initVertexBuffer(
      GLManager.getGL(),
      textureCoordinates
    );

    super(
      GLManager.getGL(),
      GLManager.getProgramInfo(),
      verticesBuffer,
      texCoordBuffer,
      vertices,
      true,
      texturePath,
      frameWidth,
      frameHeight,
      framesPerRow,
      totalFrames,
      animationSpeed,
      autoPlay,
      pixelart,
      useLighting
    );
  }
}

export default Texture;
