import GameObject from "./components/GameObject.js";
import Instance from "./Instance.js";
import InstancedTexture from "./InstancedTexture.js";
import { Vector2, Vector3 } from "./Physics.js";

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
class BitmapText {
  constructor(
    text,
    texturePath,
    letters,
    letterSpacing,
    frameWidth,
    frameHeight,
    framesPerRow,
    totalFrames,
    pixelArt,
    fontSize,
    color,
    position,
    rotation,
    useLighting = false // Default to false for text as it's typically UI
  ) {
    this.text = text;
    this.texturePath = texturePath;
    this.fontSize = fontSize;
    this.color = color;
    this.position = position;
    this.rotation = rotation;
    this.letters = letters;
    this.letterSpacing = letterSpacing;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.framesPerRow = framesPerRow;
    this.totalFrames = totalFrames;
    this.pixelArt = pixelArt;
    this.useLighting = useLighting;
    this.gameObject = new GameObject(
      text,
      position,
      rotation,
      new Vector2(fontSize * text.length, fontSize)
    );
    this.letterDictionary = {};
    for (let i = 0; i < letters.length; i++) {
      this.letterDictionary[letters[i]] = i;
    }
    // Initialize the bitmap font texture
    this.texture = new InstancedTexture(
      this.texturePath,
      text.length,
      this.frameWidth,
      this.frameHeight,
      this.framesPerRow,
      this.totalFrames,
      0,
      false,
      this.pixelArt,
      this.useLighting
    );

    // Apply the color to the texture if provided
    if (this.color) {
      this.texture.setColor(this.color);
    }

    // Apply the lighting setting to the texture
    this.texture.setUseLighting(this.useLighting);

    this.gameObject.addComponent(this.texture);
    for (let i = 0; i < text.length; i++) {
      const letter = text[i];
      const frameIndex = this.letterDictionary[letter];
      if (frameIndex !== undefined) {
        const instance = new Instance(
          letter,
          new Vector3(
            this.position.x + i * (this.frameWidth + this.letterSpacing),
            this.position.y,
            this.position.z
          ),
          new Vector2(this.fontSize, this.fontSize),
          0,
          frameIndex
        );
        this.texture.addInstance(instance);
      }
    }
  }

  /**
   * @method setColor
   * @description Updates the color of the bitmap text
   * @param {Color} color - The color to set
   */
  setColor(color) {
    this.color = color;
    if (this.texture) {
      this.texture.setColor(color);
    }
  }

  /**
   * @method setUseLighting
   * @description Controls whether the text reacts to lighting
   * @param {boolean} useLighting - Whether the text should react to lighting
   */
  setUseLighting(useLighting) {
    this.useLighting = useLighting;
    if (this.texture) {
      this.texture.setUseLighting(useLighting);
    }
  }

  /**
   * @method setText
   * @description Updates the text of the bitmap text
   * @param {string} text - The text to set
   */
  setText(text) {
    this.text = text;
    this.texture.clearInstances();
    this.texture.updateInstanceCount(this.text.length);
    for (let i = 0; i < text.length; i++) {
      const letter = text[i];
      const frameIndex = this.letterDictionary[letter];
      if (frameIndex !== undefined) {
        const instance = new Instance(
          letter,
          new Vector3(
            this.position.x + i * (this.frameWidth + this.letterSpacing),
            this.position.y,
            this.position.z
          ),
          new Vector2(this.fontSize, this.fontSize),
          0,
          frameIndex
        );
        this.texture.addInstance(instance);
      }
    }
  }

  /**
   * @method setPosition
   * @description Updates the position of the bitmap text
   * @param {Vector3} position - The position to set
   */
  setPosition(position) {
    // Vector3
    this.position = position;
    this.gameObject.transform.position = position;

    let instanceIndex = 0;
    for (let textIndex = 0; textIndex < this.text.length; textIndex++) {
      const letter = this.text[textIndex];
      const frameIndex = this.letterDictionary[letter];

      if (
        frameIndex !== undefined &&
        instanceIndex < this.texture.instances.length
      ) {
        const instance = this.texture.instances[instanceIndex];
        instance.transform.position.x =
          position.x + textIndex * (this.frameWidth + this.letterSpacing);
        instance.transform.position.y = position.y;
        instance.transform.position.z = position.z;
        instanceIndex++;
      }
    }
  }

  /**
   * @method setFontSize
   * @description Updates the font size of the bitmap text
   * @param {number} fontSize - The font size to set
   */
  setFontSize(fontSize) {
    this.fontSize = fontSize;
    this.gameObject.transform.scale = new Vector2(
      fontSize * this.text.length,
      fontSize
    );

    let instanceIndex = 0;
    for (let textIndex = 0; textIndex < this.text.length; textIndex++) {
      const letter = this.text[textIndex];
      const frameIndex = this.letterDictionary[letter];

      if (
        frameIndex !== undefined &&
        instanceIndex < this.texture.instances.length
      ) {
        const instance = this.texture.instances[instanceIndex];
        instance.transform.scale = new Vector2(fontSize, fontSize);
        instanceIndex++;
      }
    }
  }

  /**
   * @method setLetterSpacing
   * @description Updates the letter spacing of the bitmap text
   * @param {number} letterSpacing - The letter spacing to set
   */
  setLetterSpacing(letterSpacing) {
    this.letterSpacing = letterSpacing;

    let instanceIndex = 0;
    for (let textIndex = 0; textIndex < this.text.length; textIndex++) {
      const letter = this.text[textIndex];
      const frameIndex = this.letterDictionary[letter];

      if (
        frameIndex !== undefined &&
        instanceIndex < this.texture.instances.length
      ) {
        const instance = this.texture.instances[instanceIndex];
        instance.transform.position.x =
          this.position.x + textIndex * (this.frameWidth + letterSpacing);
        instance.transform.position.y = this.position.y;
        instance.transform.position.z = this.position.z;
        instanceIndex++;
      }
    }
  }
}

export default BitmapText;
