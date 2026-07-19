import * as planck from "planck";

/**
 * @function dispatchCollision
 * @description Calls onCollisionEnter/onCollisionExit on an object and its
 * component list (Behaviours), passing the other object. Duck-typed so this
 * module doesn't need to import the component classes.
 * @private
 */
function dispatchCollision(object, other, contact, type) {
  if (!object) return;
  if (typeof object[type] === "function") {
    object[type](other, contact);
  }
  if (Array.isArray(object.components)) {
    for (const comp of object.components) {
      if (comp && typeof comp[type] === "function") {
        comp[type](other, contact);
      }
    }
  }
}

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

    this.fixedTimeStep = 1 / 60;
    this.maxSubSteps = 5;
    /** @private */
    this._accumulator = 0;

    this._dispatchContacts();
  }

  /**
   * @method _dispatchContacts
   * @description Routes planck contacts to the owning objects so Behaviour
   * components receive onCollisionEnter/onCollisionExit. Bodies created through
   * RigidBody carry the owner via userData.
   * @private
   */
  _dispatchContacts() {
    const fire = (contact, type) => {
      const a = contact.getFixtureA().getBody().getUserData();
      const b = contact.getFixtureB().getBody().getUserData();
      const objA = a && a.parentObject ? a.parentObject : null;
      const objB = b && b.parentObject ? b.parentObject : null;
      dispatchCollision(objA, objB, contact, type);
      dispatchCollision(objB, objA, contact, type);
    };
    this.world.on("begin-contact", (contact) =>
      fire(contact, "onCollisionEnter")
    );
    this.world.on("end-contact", (contact) =>
      fire(contact, "onCollisionExit")
    );
  }

  /**
   * @method raycast
   * @description Casts a ray through the world and returns the closest hit.
   * @param {Object} origin - World-space { x, y } start point
   * @param {Object} direction - Ray direction { x, y } (need not be normalized)
   * @param {number} maxDistance - Max ray length in world units
   * @returns {{object, rigidBody, point, normal, fraction}|null}
   */
  raycast(origin, direction, maxDistance) {
    const scale = this.scale;
    const len = Math.hypot(direction.x, direction.y) || 1;
    const dx = direction.x / len;
    const dy = direction.y / len;
    const p1 = new planck.Vec2(origin.x / scale, origin.y / scale);
    const p2 = new planck.Vec2(
      (origin.x + dx * maxDistance) / scale,
      (origin.y + dy * maxDistance) / scale
    );

    let result = null;
    this.world.rayCast(p1, p2, (fixture, point, normal, fraction) => {
      const rb = fixture.getBody().getUserData();
      result = {
        object: rb && rb.parentObject ? rb.parentObject : null,
        rigidBody: rb || null,
        point: { x: point.x * scale, y: point.y * scale },
        normal: { x: normal.x, y: normal.y },
        fraction,
      };
      return fraction;
    });
    return result;
  }

  /**
   * @method queryPoint
   * @description Returns the objects whose colliders contain a world-space point.
   * @param {Object} point - World-space { x, y }
   * @returns {Array} - Owning objects at the point
   */
  queryPoint(point) {
    const p = new planck.Vec2(point.x / this.scale, point.y / this.scale);
    const results = [];
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      for (let f = body.getFixtureList(); f; f = f.getNext()) {
        if (f.testPoint(p)) {
          const rb = body.getUserData();
          if (rb && rb.parentObject) results.push(rb.parentObject);
          break;
        }
      }
    }
    return results;
  }

  /**
   * @method setFixedTimeStep
   * @description Sets the fixed physics step (seconds) and optional substep cap.
   * @param {number} step - Fixed step in seconds (e.g. 1/60)
   * @param {number} [maxSubSteps] - Max steps per process() call (spiral guard)
   */
  setFixedTimeStep(step, maxSubSteps = this.maxSubSteps) {
    if (step > 0) this.fixedTimeStep = step;
    this.maxSubSteps = maxSubSteps;
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
    if (!isFinite(dt) || dt <= 0) return;

    this._accumulator += dt;
    let steps = 0;
    while (
      this._accumulator >= this.fixedTimeStep &&
      steps < this.maxSubSteps
    ) {
      this.world.step(this.fixedTimeStep);
      this._accumulator -= this.fixedTimeStep;
      steps++;
    }

    if (steps === this.maxSubSteps) {
      this._accumulator = 0;
    }
  }

  /**
   * @method clear
   * @description Clears the physics engine objects and resets the gravity
   */
  clear() {
    this.world = new planck.World({
      gravity: new planck.Vec2(0, this.gravity),
    });
    this._accumulator = 0;
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
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * @method set
   * @description Sets the x and y coordinates in place
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @returns {Vector2} - This vector
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * @method clone
   * @description Returns a copy of the vector
   * @returns {Vector2} - The cloned vector
   */
  clone() {
    return new Vector2(this.x, this.y);
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
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * @method set
   * @description Sets the x, y and z coordinates in place
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {number} z - The z coordinate
   * @returns {Vector3} - This vector
   */
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * @method clone
   * @description Returns a copy of the vector
   * @returns {Vector3} - The cloned vector
   */
  clone() {
    return new Vector3(this.x, this.y, this.z);
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
