/**
 * @class Physics
 * @description Represents the physics engine
 * @param {number} gravity - The gravity of the physics engine
 * @param {number} scale - The scale of the physics engine
 * @param {number} velocityThreshold - The velocity threshold of the physics engine
 */
export class Physics {
    /**
     * @method scheduleAction
     * @description Schedules an action to be executed as soon as possible
     * @param {Function} callback - The callback function to execute
     */
    static scheduleAction(callback: Function): void;
    constructor(gravity: any, scale: any, velocityThreshold?: number);
    world: planck.World;
    gravity: any;
    scale: any;
    fixedTimeStep: number;
    maxSubSteps: number;
    /** @private */
    private _accumulator;
    /**
     * @method _dispatchContacts
     * @description Routes planck contacts to the owning objects so Behaviour
     * components receive onCollisionEnter/onCollisionExit. Bodies created through
     * RigidBody carry the owner via userData.
     * @private
     */
    private _dispatchContacts;
    /**
     * @method raycast
     * @description Casts a ray through the world and returns the closest hit.
     * @param {Object} origin - World-space { x, y } start point
     * @param {Object} direction - Ray direction { x, y } (need not be normalized)
     * @param {number} maxDistance - Max ray length in world units
     * @returns {{object, rigidBody, point, normal, fraction}|null}
     */
    raycast(origin: any, direction: any, maxDistance: number): {
        object: any;
        rigidBody: any;
        point: any;
        normal: any;
        fraction: any;
    } | null;
    /**
     * @method queryPoint
     * @description Returns the objects whose colliders contain a world-space point.
     * @param {Object} point - World-space { x, y }
     * @returns {Array} - Owning objects at the point
     */
    queryPoint(point: any): any[];
    /**
     * @method setFixedTimeStep
     * @description Sets the fixed physics step (seconds) and optional substep cap.
     * @param {number} step - Fixed step in seconds (e.g. 1/60)
     * @param {number} [maxSubSteps] - Max steps per process() call (spiral guard)
     */
    setFixedTimeStep(step: number, maxSubSteps?: number): void;
    /**
     * @method createBody
     * @description Creates a body in the physics engine
     * @param {string} type - The type of the body
     * @param {Vector2} position - The position of the body
     * @param {boolean} fixedRotation - Whether the body should have a fixed rotation
     * @param {boolean} attachFixture - Whether the body should have a fixture
     * @param {Vector2} fixtureSize - The size of the fixture
     * @param {number} density - The density of the fixture
     * @param {number} friction - The friction of the fixture
     * @param {number} restitution - The restitution of the fixture
     * @returns {Body} - The body
     */
    createBody(type: string, position?: Vector2, fixedRotation?: boolean, attachFixture?: boolean, fixtureSize?: Vector2, density?: number, friction?: number, restitution?: number): Body;
    /**
     * @method onCollisionEnter
     * @description Handles the collision enter event
     * @param {Function} callback - The callback function to handle the collision enter event
     */
    onCollisionEnter(callback: Function): void;
    /**
     * @method onCollisionExit
     * @description Handles the collision exit event
     * @param {Function} callback - The callback function to handle the collision exit event
     */
    onCollisionExit(callback: Function): void;
    /**
     * @method process
     * @description Processes the physics engine
     * @param {number} dt - The delta time
     */
    process(dt: number): void;
    /**
     * @method clear
     * @description Clears the physics engine objects and resets the gravity
     */
    clear(): void;
    /**
     * @method getGravity
     * @description Returns the gravity of the physics engine
     * @returns {number} - The gravity of the physics engine
     */
    getGravity(): number;
    /**
     * @method getScale
     * @description Returns the scale of the physics engine
     * @returns {number} - The scale of the physics engine
     */
    getScale(): number;
}
/**
 * @class Vector2
 * @description Represents a 2D vector
 * @param {number} x - The x coordinate of the vector
 * @param {number} y - The y coordinate of the vector
 */
export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    /**
     * @method set
     * @description Sets the x and y coordinates in place
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @returns {Vector2} - This vector
     */
    set(x: number, y: number): Vector2;
    /**
     * @method clone
     * @description Returns a copy of the vector
     * @returns {Vector2} - The cloned vector
     */
    clone(): Vector2;
    /**
     * @method equals
     * @description Checks if the vector is equal to another vector
     * @param {Vector2} other - The other vector
     * @returns {boolean} - True if the vector is equal to the other vector
     */
    equals(other: Vector2): boolean;
    /**
     * @method getX
     * @description Returns the x coordinate of the vector
     * @returns {number} - The x coordinate of the vector
     */
    getX(): number;
    /**
     * @method getY
     * @description Returns the y coordinate of the vector
     * @returns {number} - The y coordinate of the vector
     */
    getY(): number;
}
/**
 * @class Vector3
 * @description Represents a 3D vector
 * @param {number} x - The x coordinate of the vector
 * @param {number} y - The y coordinate of the vector
 * @param {number} z - The z coordinate of the vector
 */
export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    /**
     * @method set
     * @description Sets the x, y and z coordinates in place
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {number} z - The z coordinate
     * @returns {Vector3} - This vector
     */
    set(x: number, y: number, z: number): Vector3;
    /**
     * @method clone
     * @description Returns a copy of the vector
     * @returns {Vector3} - The cloned vector
     */
    clone(): Vector3;
    /**
     * @method equals
     * @description Checks if the vector is equal to another vector
     * @param {Vector3} other - The other vector
     * @returns {boolean} - True if the vector is equal to the other vector
     */
    equals(other: Vector3): boolean;
    /**
     * @method getX
     * @description Returns the x coordinate of the vector
     * @returns {number} - The x coordinate of the vector
     */
    getX(): number;
    /**
     * @method getY
     * @description Returns the y coordinate of the vector
     * @returns {number} - The y coordinate of the vector
     */
    getY(): number;
    /**
     * @method getZ
     * @description Returns the z coordinate of the vector
     * @returns {number} - The z coordinate of the vector
     */
    getZ(): number;
}
import * as planck from "planck";
