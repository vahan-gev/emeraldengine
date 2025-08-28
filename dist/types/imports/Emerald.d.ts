import Color from "./Color";
import { Vector3 } from "./Physics";
import PointLight from "./lights/PointLight";
import DirectionalLight from "./lights/DirectionalLight";
import Scene from "./Scene";
/**
 * @class Emerald
 * @description A class that represents the Emerald engine
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
declare class Emerald {
    shaderProgram: WebGLProgram;
    gl: WebGL2RenderingContext;
    programInfo: any;
    camera: any;
    ambientLight: Vector3;
    pointLights: PointLight[];
    directionalLights: DirectionalLight[];
    debugLogged: boolean;
    backgroundColor: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    constructor(canvas: HTMLCanvasElement);
    /**
     * @method setAmbientLight
     * @description Sets the ambient light for the scene
     * @param {Vector3} vector3 - The ambient light color as a Vector3 instance
     */
    setAmbientLight(vector3: Vector3): void;
    /**
     * @method resize
     * @description Resizes the canvas
     * @param {number} width - The width of the canvas
     * @param {number} height - The height of the canvas
     */
    resize(width: number, height: number): void;
    /**
     * @method addPointLight
     * @description Adds a point light to the scene
     * @param {PointLight} pointLight - The point light to add
     */
    addPointLight(pointLight: PointLight): void;
    /**
     * @method addDirectionalLight
     * @description Adds a directional light to the scene
     * @param {DirectionalLight} directionalLight - The directional light to add
     */
    addDirectionalLight(directionalLight: DirectionalLight): void;
    /**
     * @method removeDirectionalLight
     * @description Removes a directional light from the scene
     * @param {DirectionalLight} directionalLight - The directional light to remove
     */
    removeDirectionalLight(directionalLight: DirectionalLight): void;
    /**
     * @method setBackgroundColor
     * @description Sets the background color of the scene
     * @param {Color} color - The background color
     */
    setBackgroundColor(color: Color): void;
    /**
     * @method drawScene
     * @description Draws the scene
     * @param {Scene} scene - The scene to draw
     * @param {number} deltaTime - The delta time
     */
    drawScene(scene: Scene, deltaTime: number): void;
}
export default Emerald;
//# sourceMappingURL=Emerald.d.ts.map