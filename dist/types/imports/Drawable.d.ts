import Color from "./Color";
import { mat4 } from "gl-matrix";
import GameObject from "./components/GameObject";
/**
 * @class Drawable
 * @description A class that represents a drawable object
 * @param {WebGLRenderingContext} gl - The WebGL rendering context
 * @param {Object} programInfo - The program information
 * @param {WebGLBuffer} verticesBuffer - The vertices buffer
 * @param {WebGLBuffer} texCoordBuffer - The texture coordinate buffer
 * @param {Array} vertices - The vertices of the object
 * @param {boolean} useTexture - Whether to use a texture
 * @param {string} texturePath - The path to the texture
 * @param {number} frameWidth - The width of the frame
 * @param {number} frameHeight - The height of the frame
 * @param {number} framesPerRow - The number of frames per row
 * @param {number} totalFrames - The total number of frames
 * @param {number} animationSpeed - The speed of the animation
 * @param {boolean} autoplay - Whether to autoplay the animation
 * @param {boolean} pixelart - Whether to use pixel art
 * @param {boolean} useLighting - Whether to use lighting
 */
declare class Drawable {
    gl: WebGL2RenderingContext;
    programInfo: any;
    id: string;
    verticesBuffer: WebGLBuffer;
    texCoordBuffer: WebGLBuffer;
    vertices: number[];
    color: Color;
    texturePath: string;
    texture: WebGLTexture | null;
    useTexture: boolean;
    frameWidth: number;
    frameHeight: number;
    framesPerRow: number;
    totalFrames: number;
    currentFrame: number;
    animationSpeed: number;
    lastFrameTime: number;
    textureWidth: number;
    textureHeight: number;
    isPlaying: boolean;
    playOnce: boolean;
    originalTexture: WebGLTexture | null;
    mirrored: boolean;
    animationType: string;
    currentAnimationArray: number[];
    currentAnimationIndex: number;
    shouldRevertAfterPlayingOnce: boolean;
    revertAnimation: number[];
    parentObject: any;
    isActive: boolean;
    isWireframe: boolean;
    callbackFunction: () => void;
    pixelart: boolean;
    useLighting: boolean;
    constructor(gl: WebGL2RenderingContext, programInfo: any, verticesBuffer: WebGLBuffer, texCoordBuffer: WebGLBuffer, vertices: number[], useTexture: boolean, texturePath: string, frameWidth?: number, frameHeight?: number, framesPerRow?: number, totalFrames?: number, animationSpeed?: number, autoplay?: boolean, pixelart?: boolean, useLighting?: boolean);
    /**
     * @method setIsWireframe
     * @description Sets the wireframe mode
     * @param {boolean} bool - Whether to enable wireframe mode
     */
    setIsWireframe(bool: boolean): void;
    /**
     * @method setUseLighting
     * @description Sets the lighting mode
     * @param {boolean} useLighting - Whether to enable lighting reaction
     */
    setUseLighting(useLighting: boolean): void;
    /**
     * @method setIsActive
     * @description Sets the active state
     * @param {boolean} bool - Whether to enable the active state
     */
    setIsActive(bool: boolean): void;
    /**
     * @method setParent
     * @description Sets the parent object
     * @param {Object} parent - The parent object
     */
    setParent(parent: GameObject): void;
    /**
     * @method getParent
     * @description Gets the parent object
     * @returns {Object} - The parent object
     */
    getParent(): GameObject | null;
    /**
     * @method setColor
     * @description Sets the color of the object
     * @param {Color} color - The color to set
     */
    setColor(color: Color): void;
    /**
     * @method initTexture
     * @description Initializes the texture
     */
    initTexture(): Promise<void>;
    /**
     * @method updateAnimation
     * @description Updates the animation
     * @param {number} currentTime - The current time
     */
    updateAnimation(currentTime: number): void;
    /**
     * @method getAnimation
     * @description Gets the animation
     * @returns {Array} - The animation
     */
    getAnimation(): number[] | string | null;
    /**
     * @method playAnimation
     * @description Plays an animation
     * @param {Array} animation - The animation to play
     * @param {number} animationSpeed - The speed of the animation
     */
    playAnimation(animation: number[], animationSpeed?: number): void;
    /**
     * @method setFrame
     * @description Sets the frame
     * @param {number} frame - The frame to set
     */
    setFrame(frame: number): void;
    /**
     * @method playAnimationOnce
     * @description Plays an animation once
     * @param {Array} animation - The animation to play
     * @param {Array} defaultAnimation - The default animation
     * @param {number} animationSpeed - The speed of the animation
     * @param {function} callbackFunction - The callback function
     */
    playAnimationOnce(animation: number[], defaultAnimation?: number[] | null, animationSpeed?: number, callbackFunction?: (() => void) | null): void;
    /**
     * @method stopAnimation
     * @description Stops the animation
     */
    stopAnimation(): void;
    /**
     * @method draw
     * @description Draws the object
     * @param {mat4} globalViewMatrix - The global view matrix
     * @param {WebGLUniformLocation} uniformLocation - The uniform location
     * @param {number} currentTime - The current time
     * @param {Object} objectTransform - The object transform
     */
    draw(globalViewMatrix: mat4, uniformLocation: WebGLUniformLocation, currentTime: number, objectTransform: any): void;
    /**
     * @method loadImage
     * @description Loads an image
     * @param {string} path - The path to the image
     * @returns {Promise} - The promise
     */
    loadImage: (path: string) => Promise<unknown>;
}
export default Drawable;
//# sourceMappingURL=Drawable.d.ts.map