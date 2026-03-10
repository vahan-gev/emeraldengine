import IDManager from "../managers/IDManager.js";

/**
 * @class Collider
 * @param {Rigidbody} rigidbody - The rigidbody to attach the collider to
 * @param {boolean} isSensor - Whether the collider is a sensor
 * @param {GameObject} parentObject - The parent object of the collider
 */
class Collider {
    constructor(rigidbody, isSensor = false, parentObject = null) {
        this.rigidbody = rigidbody;
        this.parentObject = parentObject;
        this.isSensor = isSensor;
        this.id = IDManager.generateUniqueID();
        this.name = "Collider" + this.id;
    }

    /**
     * @method getRigidBody
     * @description Returns the rigidbody of the collider
     */
    getRigidBody() {
        return this.rigidbody;
    }

    /**
     * @method getCollider
     * @description Returns the collider
     */
    getCollider() {
        return this.collider;
    }

    /**
     * @method setParent
     * @description Sets the parent object of the collider
     */
    setParent(parent) {
        this.parentObject = parent;
    }

    /**
     * @method getParent
     * @description Returns the parent object of the collider
     */
    getParent() {
        return this.parentObject;
    }
}

export default Collider;