export default Pool;
/**
 * @class Pool
 * @description Generic object pool to avoid per-frame allocations for churny
 * objects (bullets, particles, enemies). Provide a factory and an optional
 * reset function; acquire reused objects and release them when done.
 *
 * @example
 * const bullets = new Pool(() => new Bullet(), (b, x, y) => b.spawn(x, y), 50);
 * const b = bullets.acquire(px, py);
 * // later...
 * bullets.release(b);
 */
declare class Pool {
    /**
     * @param {Function} factory - Creates a new pooled object
     * @param {Function} [reset] - Called on acquire as reset(obj, ...args)
     * @param {number} [initialSize] - Number of objects to pre-create
     */
    constructor(factory: Function, reset?: Function, initialSize?: number);
    factory: Function;
    reset: Function;
    available: any[];
    active: Set<any>;
    /**
     * @method acquire
     * @description Returns a pooled object (reused or freshly created). Extra
     * arguments are forwarded to the reset function.
     * @returns {*} - The acquired object
     */
    acquire(...args: any[]): any;
    /**
     * @method release
     * @description Returns an object to the pool.
     * @param {*} obj - The object to release
     */
    release(obj: any): void;
    /**
     * @method releaseAll
     * @description Returns every active object to the pool.
     */
    releaseAll(): void;
    /**
     * @member activeCount
     * @description Number of currently-acquired objects.
     */
    get activeCount(): number;
    /**
     * @member size
     * @description Total objects managed by the pool (active + available).
     */
    get size(): number;
}
