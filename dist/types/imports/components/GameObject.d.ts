import { Vector2, Vector3 } from "../Physics";
import Transform from "../Transform";
import RigidBody from "./RigidBody";
import { mat4 } from "gl-matrix";
/**
 * @class GameObject
 * @param {string} name - The name of the game object
 * @param {Vector3} position - The position of the game object
 * @param {number} rotation - The rotation of the game object
 * @param {Vector2} scale - The scale of the game object
 */
declare class GameObject {
    name: string;
    components: any[];
    id: string;
    isActive: boolean;
    transform: Transform;
    opacity: number;
    constructor(name: string, position?: Vector3, rotation?: number, scale?: Vector2);
    /**
     * @method addComponent
     * @description Adds a component to the game object
     * @param {Component} componentInstance - The component to add
     */
    addComponent(componentInstance: any): void;
    /**
     * @method removeComponent
     * @description Removes a component from the game object
     * @param {Component} component - The component to remove
     */
    removeComponent(component: any): void;
    /**
     * @method setIsActive
     * @description Sets the active state of the game object
     * @param {boolean} bool - The active state
     */
    setIsActive(bool: boolean): void;
    /**
     * @method setOpacity
     * @description Sets the opacity of the game object (0..1)
     * @param {number} value - The opacity value between 0 and 1
     */
    setOpacity(value: number): void;
    /**
     * @method getOpacity
     * @description Gets the opacity of the game object
     * @returns {number} - The opacity value between 0 and 1
     */
    getOpacity(): number;
    /**
     * @method getComponent
     * @description Returns a component from the game object
     * @param {Component} componentType - The type of component to return
     */
    getComponent(componentType: any): any;
    /**
     * @method getRigidBodyAtPosition
     * @description Returns the rigidbody at a position
     * @param {Vector2} position - The position to check
     */
    getRigidBodyAtPosition(position: Vector2): RigidBody | null;
    /**
     * @method draw
     * @description Draws the game object
     * @param {Matrix4} globalViewMatrix - The global view matrix
     * @param {WebGLUniformLocation} uniformLocation - The uniform location
     * @param {number} currentTime - The current time
     */
    draw(globalViewMatrix: mat4, uniformLocation: WebGLUniformLocation, currentTime: number): void;
}
export default GameObject;
//# sourceMappingURL=GameObject.d.ts.map