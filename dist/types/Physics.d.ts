import * as planck from "planck";
/**
 * @class Physics
 * @description Represents the physics engine
 * @param {number} gravity - The gravity of the physics engine
 * @param {number} scale - The scale of the physics engine
 * @param {number} velocityThreshold - The velocity threshold of the physics engine
 */
declare class Physics {
    world: planck.World;
    gravity: number;
    scale: number;
    constructor(gravity: number, scale: number, velocityThreshold?: number);
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
    createBody(type: string, position?: Vector2, fixedRotation?: boolean, attachFixture?: boolean, fixtureSize?: Vector2, density?: number, friction?: number, restitution?: number): planck.Body;
    /**
     * @method onCollisionEnter
     * @description Handles the collision enter event
     * @param {Function} callback - The callback function to handle the collision enter event
     */
    onCollisionEnter(callback: (bodyA: planck.Body, bodyB: planck.Body, contact: planck.Contact) => void): void;
    /**
     * @method onCollisionExit
     * @description Handles the collision exit event
     * @param {Function} callback - The callback function to handle the collision exit event
     */
    onCollisionExit(callback: (bodyA: planck.Body, bodyB: planck.Body, contact: planck.Contact) => void): void;
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
    /**
     * @method scheduleAction
     * @description Schedules an action to be executed as soon as possible
     * @param {Function} callback - The callback function to execute
     */
    static scheduleAction(callback: () => void): void;
}
/**
 * @class Vector2
 * @description Represents a 2D vector
 * @param {number} x - The x coordinate of the vector
 * @param {number} y - The y coordinate of the vector
 */
declare class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number);
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
declare class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
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
export { Physics, Vector2, Vector3 };
//# sourceMappingURL=Physics.d.ts.map