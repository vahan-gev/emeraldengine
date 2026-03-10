import Color from "./Color";
import GameObject from "./components/GameObject";
import InstancedTexture from "./InstancedTexture";
import { Vector3 } from "./Physics";
/**
 * BitmapText class for rendering text using a bitmap font texture
 * @param {string} text - The text to display
 * @param {string} texturePath - Path to the bitmap font texture
 * @param {string} letters - String containing all available characters in the font
 * @param {number} letterSpacing - Spacing between letters
 * @param {number} frameWidth - Width of each character frame
 * @param {number} frameHeight - Height of each character frame
 * @param {number} framesPerRow - Number of character frames per row in the texture
 * @param {number} totalFrames - Total number of character frames
 * @param {boolean} pixelArt - Whether to use pixel-perfect rendering
 * @param {number} fontSize - Size of the rendered text
 * @param {Color} color - Color tint for the text
 * @param {Vector3} position - Position of the text
 * @param {number} rotation - Rotation of the text
 * @param {boolean} useLighting - Whether the text should react to lighting (default: false)
 */
declare class BitmapText {
    text: string;
    texturePath: string;
    fontSize: number;
    color: Color;
    position: Vector3;
    rotation: number;
    letters: string;
    letterSpacing: number;
    frameWidth: number;
    frameHeight: number;
    framesPerRow: number;
    totalFrames: number;
    pixelArt: boolean;
    useLighting: boolean;
    gameObject: GameObject;
    letterDictionary: Record<string, number>;
    texture: InstancedTexture;
    constructor(text: string, texturePath: string, letters: string, letterSpacing: number, frameWidth: number, frameHeight: number, framesPerRow: number, totalFrames: number, pixelArt: boolean, fontSize: number, color: Color, position: Vector3, rotation: number, useLighting?: boolean);
    /**
     * @method setColor
     * @description Updates the color of the bitmap text
     * @param {Color} color - The color to set
     */
    setColor(color: Color): void;
    /**
     * @method setUseLighting
     * @description Controls whether the text reacts to lighting
     * @param {boolean} useLighting - Whether the text should react to lighting
     */
    setUseLighting(useLighting: boolean): void;
    /**
     * @method setText
     * @description Updates the text of the bitmap text
     * @param {string} text - The text to set
     */
    setText(text: string): void;
    /**
     * @method setPosition
     * @description Updates the position of the bitmap text
     * @param {Vector3} position - The position to set
     */
    setPosition(position: Vector3): void;
    /**
     * @method setFontSize
     * @description Updates the font size of the bitmap text
     * @param {number} fontSize - The font size to set
     */
    setFontSize(fontSize: number): void;
    /**
     * @method setLetterSpacing
     * @description Updates the letter spacing of the bitmap text
     * @param {number} letterSpacing - The letter spacing to set
     */
    setLetterSpacing(letterSpacing: number): void;
}
export default BitmapText;
//# sourceMappingURL=BitmapText.d.ts.map