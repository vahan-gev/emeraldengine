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
class Pool {
  /**
   * @param {Function} factory - Creates a new pooled object
   * @param {Function} [reset] - Called on acquire as reset(obj, ...args)
   * @param {number} [initialSize] - Number of objects to pre-create
   */
  constructor(factory, reset = null, initialSize = 0) {
    if (typeof factory !== "function") {
      throw new Error("[Pool] > factory must be a function");
    }
    this.factory = factory;
    this.reset = reset;
    this.available = [];
    this.active = new Set();

    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  /**
   * @method acquire
   * @description Returns a pooled object (reused or freshly created). Extra
   * arguments are forwarded to the reset function.
   * @returns {*} - The acquired object
   */
  acquire(...args) {
    const obj = this.available.length ? this.available.pop() : this.factory();
    this.active.add(obj);
    if (this.reset) this.reset(obj, ...args);
    return obj;
  }

  /**
   * @method release
   * @description Returns an object to the pool.
   * @param {*} obj - The object to release
   */
  release(obj) {
    if (this.active.delete(obj)) {
      this.available.push(obj);
    }
  }

  /**
   * @method releaseAll
   * @description Returns every active object to the pool.
   */
  releaseAll() {
    for (const obj of this.active) {
      this.available.push(obj);
    }
    this.active.clear();
  }

  /**
   * @member activeCount
   * @description Number of currently-acquired objects.
   */
  get activeCount() {
    return this.active.size;
  }

  /**
   * @member size
   * @description Total objects managed by the pool (active + available).
   */
  get size() {
    return this.available.length + this.active.size;
  }
}

export default Pool;
