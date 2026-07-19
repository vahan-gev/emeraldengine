export default Texture;
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
declare class Texture extends Drawable {
    constructor(texturePath?: {}, frameWidth?: number, frameHeight?: number, framesPerRow?: number, totalFrames?: number, animationSpeed?: number, autoPlay?: boolean, pixelart?: boolean, useLighting?: boolean);
}
import Drawable from "./Drawable.js";
