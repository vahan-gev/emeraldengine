import * as planck from "planck";

/**
 * @class Physics
 * @description Represents the physics engine
 * @param {number} gravity - The gravity of the physics engine
 * @param {number} scale - The scale of the physics engine
 * @param {number} velocityThreshold - The velocity threshold of the physics engine
 */
class Physics {
  constructor(gravity, scale, velocityThreshold = 0.1) {
    this.world = new planck.World({
      gravity: new planck.Vec2(0, gravity),
    });
    planck.Settings.velocityThreshold = velocityThreshold;
    this.gravity = gravity;
    this.scale = scale;
  }

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
  createBody(
    type,
    position = new Vector2(0, 0),
    fixedRotation = false,
    attachFixture = true,
    fixtureSize = new Vector2(1, 1),
    density = 0,
    friction = 0,
    restitution = 0
  ) {
    const bodyRef = this.world.createBody({
      type: type,
      position: new planck.Vec2(
        position.x / this.scale,
        position.y / this.scale
      ),
      fixedRotation: fixedRotation,
    });

    if (attachFixture) {
      bodyRef.createFixture(new planck.Box(fixtureSize.x, fixtureSize.y), {
        density: density,
        friction: friction,
        restitution: restitution,
      });
    }

    return bodyRef;
  }

  /**
   * @method onCollisionEnter
   * @description Handles the collision enter event
   * @param {Function} callback - The callback function to handle the collision enter event
   */
  onCollisionEnter(callback) {
    this.world.on("begin-contact", (contact) => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();

      const bodyA = fixtureA.getBody();
      const bodyB = fixtureB.getBody();

      callback(bodyA, bodyB, contact);
    });
  }

  /**
   * @method onCollisionExit
   * @description Handles the collision exit event
   * @param {Function} callback - The callback function to handle the collision exit event
   */
  onCollisionExit(callback) {
    this.world.on("end-contact", (contact) => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();

      const bodyA = fixtureA.getBody();
      const bodyB = fixtureB.getBody();

      callback(bodyA, bodyB, contact);
    });
  }

  /**
   * @method process
   * @description Processes the physics engine
   * @param {number} dt - The delta time
   */
  process(dt) {
    this.world.step(dt);
  }

  /**
   * @method clear
   * @description Clears the physics engine objects and resets the gravity
   */
  clear() {
    this.world = new planck.World({
      gravity: new planck.Vec2(0, this.gravity),
    });
  }

  /**
   * @method getGravity
   * @description Returns the gravity of the physics engine
   * @returns {number} - The gravity of the physics engine
   */
  getGravity() {
    return this.gravity;
  }

  /**
   * @method getScale
   * @description Returns the scale of the physics engine
   * @returns {number} - The scale of the physics engine
   */
  getScale() {
    return this.scale;
  }

  /**
   * @method scheduleAction
   * @description Schedules an action to be executed as soon as possible
   * @param {Function} callback - The callback function to execute
   */
  static scheduleAction(callback) {
    if (typeof callback === "function") {
      setTimeout(() => {
        callback();
      }, 0);
    }
  }
}

/**
 * @class Vector2
 * @description Represents a 2D vector
 * @param {number} x - The x coordinate of the vector
 * @param {number} y - The y coordinate of the vector
 */
class Vector2 {
  constructor(x, y) {
    return new planck.Vec2(x, y);
  }

  /**
   * @method equals
   * @description Checks if the vector is equal to another vector
   * @param {Vector2} other - The other vector
   * @returns {boolean} - True if the vector is equal to the other vector
   */
  equals(other) {
    if (!other) return false;
    if (!(other instanceof Vector2)) return false;
    return this.x === other.x && this.y === other.y;
  }

  /**
   * @method getX
   * @description Returns the x coordinate of the vector
   * @returns {number} - The x coordinate of the vector
   */
  getX() {
    return this.x;
  }

  /**
   * @method getY
   * @description Returns the y coordinate of the vector
   * @returns {number} - The y coordinate of the vector
   */
  getY() {
    return this.y;
  }
}

/**
 * @class Vector3
 * @description Represents a 3D vector
 * @param {number} x - The x coordinate of the vector
 * @param {number} y - The y coordinate of the vector
 * @param {number} z - The z coordinate of the vector
 */
class Vector3 {
  constructor(x, y, z) {
    return new planck.Vec3(x, y, z);
  }

  /**
   * @method equals
   * @description Checks if the vector is equal to another vector
   * @param {Vector3} other - The other vector
   * @returns {boolean} - True if the vector is equal to the other vector
   */
  equals(other) {
    if (!other) return false;
    if (!(other instanceof Vector3)) return false;
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  /**
   * @method getX
   * @description Returns the x coordinate of the vector
   * @returns {number} - The x coordinate of the vector
   */
  getX() {
    return this.x;
  }

  /**
   * @method getY
   * @description Returns the y coordinate of the vector
   * @returns {number} - The y coordinate of the vector
   */
  getY() {
    return this.y;
  }

  /**
   * @method getZ
   * @description Returns the z coordinate of the vector
   * @returns {number} - The z coordinate of the vector
   */
  getZ() {
    return this.z;
  }
}

export { Physics, Vector2, Vector3 };
