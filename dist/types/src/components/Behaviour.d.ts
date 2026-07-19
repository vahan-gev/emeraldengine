export default Behaviour;
/**
 * @class Behaviour
 * @description Base class for custom per-object game logic. Subclass it and
 * override `start()` (called once, the first update after being added) and
 * `update(deltaTime)` (called every frame the owner is active). Add it to a
 * GameObject like any other component; it is ticked by `Scene.update(dt)` via
 * `GameObject.update(dt)`.
 *
 * @example
 * class Spinner extends Behaviour {
 *   start() { this.speed = 2; }
 *   update(dt) { this.gameObject.transform.rotation += this.speed * dt; }
 * }
 * obj.addComponent(new Spinner());
 */
declare class Behaviour {
    id: string;
    parentObject: any;
    enabled: boolean;
    /** @private */
    private _started;
    /**
     * @member gameObject
     * @description Convenience accessor for the owning GameObject.
     */
    get gameObject(): any;
    /**
     * @method setParent
     * @description Sets the owning object. Called automatically by addComponent.
     * @param {Object} parent - The owning GameObject (or Instance)
     */
    setParent(parent: any): void;
    /**
     * @method getParent
     * @description Returns the owning object
     * @returns {Object} - The owning object
     */
    getParent(): any;
    /**
     * @method start
     * @description Called once before the first update. Override in subclasses.
     */
    start(): void;
    /**
     * @method update
     * @description Called every active frame. Override in subclasses.
     * @param {number} deltaTime - Seconds since the previous frame (time-scaled)
     */
    update(deltaTime: number): void;
    /**
     * @method onDestroy
     * @description Called when the behaviour is removed. Override for cleanup.
     */
    onDestroy(): void;
    /**
     * @method onCollisionEnter
     * @description Called when the owner's body starts touching another. Requires
     * the Physics world to be ticked. Override in subclasses.
     * @param {Object} other - The other GameObject/Instance (or null)
     * @param {Object} contact - The planck contact
     */
    onCollisionEnter(other: any, contact: any): void;
    /**
     * @method onCollisionExit
     * @description Called when the owner's body stops touching another.
     * @param {Object} other - The other GameObject/Instance (or null)
     * @param {Object} contact - The planck contact
     */
    onCollisionExit(other: any, contact: any): void;
}
