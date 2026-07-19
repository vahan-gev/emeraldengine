export default GameObject;
/**
 * @class GameObject
 * @param {string} name - The name of the game object
 * @param {Vector3} position - The position of the game object
 * @param {number} rotation - The rotation of the game object
 * @param {Vector2} scale - The scale of the game object
 */
declare class GameObject {
    constructor(name: any, position?: Vector3, rotation?: number, scale?: Vector2);
    name: any;
    components: any[];
    id: string;
    isActive: boolean;
    transform: Transform;
    opacity: number;
    layer: number;
    screenSpace: boolean;
    /**
     * @method setLayer
     * @description Sets the render layer. Objects are drawn by layer first, then
     * by z within a layer.
     * @param {number} layer - The layer index
     * @returns {GameObject} - this
     */
    setLayer(layer: number): GameObject;
    /**
     * @method setScreenSpace
     * @description When true, the object ignores the camera (fixed on screen) —
     * useful for HUD/UI. Position is then in pixels from the viewport center.
     * Note: not supported for InstancedTexture-based objects.
     * @param {boolean} value
     * @returns {GameObject} - this
     */
    setScreenSpace(value: boolean): GameObject;
    /**
     * @method addComponent
     * @description Adds a component to the game object
     * @param {Component} componentInstance - The component to add
     */
    addComponent(componentInstance: Component): void;
    /**
     * @method removeComponent
     * @description Removes a component from the game object
     * @param {Component} component - The component to remove
     */
    removeComponent(component: Component): void;
    /**
     * @method update
     * @description Ticks the lifecycle of Behaviour components on this object.
     * Only Behaviours are ticked here so component types with their own update
     * signature (e.g. InstancedTexture) are left untouched.
     * @param {number} deltaTime - Seconds since the previous frame (time-scaled)
     */
    update(deltaTime: number): void;
    /**
     * @method setParent
     * @description Parents this object to another GameObject (or detaches with
     * null). The object's transform then composes on top of the parent's, so
     * moving/rotating/scaling the parent moves its children.
     * @param {GameObject|null} parent - The parent GameObject, or null
     * @returns {GameObject} - this
     */
    setParent(parent: GameObject | null): GameObject;
    /**
     * @method addChild
     * @description Parents another GameObject to this one.
     * @param {GameObject} child - The child GameObject
     * @returns {GameObject} - this
     */
    addChild(child: GameObject): GameObject;
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
    getComponent(componentType: Component): any;
    /**
     * @method getRigidBodyAtPosition
     * @description Returns the rigidbody at a position
     * @param {Vector2} position - The position to check
     */
    getRigidBodyAtPosition(position: Vector2): RigidBody;
    /**
     * @method syncPhysics
     * @description Copies simulation state (position + rotation) from this
     * object's dynamic rigidbody onto its transform, and mirrors it onto any
     * visible collider debug shape. Called once per frame from the render loop so
     * draw() stays read-only and physics isn't re-applied per camera. Also
     * forwards to components that own their own physics-driven content (e.g.
     * InstancedTexture).
     */
    syncPhysics(): void;
    /**
     * @method destroy
     * @description Permanently tears the object down: disposes every Drawable's
     * GPU resources, destroys physics bodies, and runs Behaviour.onDestroy().
     * Use it (or Scene.remove(obj, { dispose: true })) when an object will not
     * be re-added — plain Scene.remove() keeps GPU resources alive for re-use.
     * Safe to call twice.
     */
    destroy(): void;
    /** @private */
    private _destroyed;
    /**
     * @method draw
     * @description Draws the game object
     * @param {Matrix4} globalViewMatrix - The global view matrix
     * @param {WebGLUniformLocation} uniformLocation - The uniform location
     * @param {number} currentTime - The current time
     */
    draw(globalViewMatrix: Matrix4, uniformLocation: WebGLUniformLocation, currentTime: number): void;
}
import Transform from "../Transform.js";
import { Vector2 } from "../Physics.js";
import RigidBody from "./RigidBody.js";
import { Vector3 } from "../Physics.js";
