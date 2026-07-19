/**
 * @class Coroutine
 * @description Generator-based sequencing for time-based logic, layered on top of
 * the same per-frame delta the rest of the engine uses. Write a generator that
 * `yield`s instructions, and the runner advances it each frame:
 *
 *   - `yield seconds` (a number)        -> wait that many seconds
 *   - `yield Coroutine.waitFrames(n)`   -> wait n frames
 *   - `yield Coroutine.waitUntil(fn)`   -> wait until fn() is truthy
 *   - `yield Coroutine.waitWhile(fn)`   -> wait while fn() is truthy
 *   - `yield somePromise`               -> wait for the promise to resolve
 *   - `yield anotherCoroutine`          -> wait for a nested coroutine to finish
 *   - `yield Coroutine.tween(...)`      -> drive a value over time, then continue
 *
 * Coroutines are driven by `Coroutine.update(dt)` (called automatically from
 * `Emerald.drawScene`, so they honor pause/slow-mo via Time.timeScale).
 *
 * @example
 * Coroutine.start(function* () {
 *   door.open();
 *   yield 1.5;                       // wait 1.5s
 *   yield Coroutine.waitUntil(() => player.isReady);
 *   boss.spawn();
 * });
 */
class Coroutine {
  /**
   * @method start
   * @description Starts a coroutine from a generator function (or an existing
   * generator/iterator). Returns a handle with `cancel()` and `done`.
   * @param {GeneratorFunction|Generator} gen - The generator (function) to run
   * @param {...*} args - Arguments forwarded to the generator function
   * @returns {Object} - A handle: { cancel(), done, isRunning() }
   */
  static start(gen, ...args) {
    const iterator = typeof gen === "function" ? gen(...args) : gen;
    const routine = {
      iterator,
      wait: null,
      cancelled: false,
      done: false,
      _resolve: null,
    };
    routine.promise = new Promise((resolve) => (routine._resolve = resolve));
    routine.cancel = () => {
      routine.cancelled = true;
    };
    routine.isRunning = () => !routine.done && !routine.cancelled;
    Coroutine._routines.push(routine);
    Coroutine._advance(routine, undefined, 0);
    return routine;
  }

  /**
   * @method waitFrames
   * @description Yieldable that waits a number of frames.
   * @param {number} count - Frames to wait
   */
  static waitFrames(count) {
    return { __coroutine: "frames", count: Math.max(0, count | 0) };
  }

  /**
   * @method waitUntil
   * @description Yieldable that blocks until the predicate returns truthy.
   * @param {Function} predicate
   */
  static waitUntil(predicate) {
    return { __coroutine: "until", predicate };
  }

  /**
   * @method waitWhile
   * @description Yieldable that blocks while the predicate returns truthy.
   * @param {Function} predicate
   */
  static waitWhile(predicate) {
    return { __coroutine: "until", predicate: () => !predicate() };
  }

  /**
   * @method tween
   * @description Yieldable that interpolates from `from` to `to` over `duration`
   * seconds, calling `onUpdate(value)` each frame, then resumes the coroutine.
   * @param {number} from
   * @param {number} to
   * @param {number} duration - Seconds
   * @param {Function} onUpdate - Receives the current value each step
   * @param {Function} [easing] - Optional easing t -> t
   */
  static tween(from, to, duration, onUpdate, easing) {
    return {
      __coroutine: "tween",
      from,
      to,
      duration: Math.max(0, duration),
      onUpdate,
      easing: easing || ((t) => t),
      elapsed: 0,
    };
  }

  /**
   * @method update
   * @description Advances all running coroutines by dt seconds. Driven by
   * Emerald.drawScene.
   * @param {number} dt - Seconds since the last frame (time-scaled)
   */
  static update(dt) {
    const routines = Coroutine._routines;
    for (let i = routines.length - 1; i >= 0; i--) {
      const routine = routines[i];
      if (routine.cancelled || routine.done) {
        Coroutine._finish(routine);
        routines.splice(i, 1);
        continue;
      }
      Coroutine._step(routine, dt);
      if (routine.cancelled || routine.done) {
        Coroutine._finish(routine);
        routines.splice(i, 1);
      }
    }
  }

  /**
   * @method clearAll
   * @description Cancels and removes every running coroutine.
   */
  static clearAll() {
    for (const r of Coroutine._routines) r.cancelled = true;
    Coroutine._routines.length = 0;
  }

  /**
   * @method count
   * @returns {number} - Number of currently running coroutines
   */
  static count() {
    return Coroutine._routines.length;
  }

  /** @private */
  static _finish(routine) {
    if (routine._resolve) {
      const resolve = routine._resolve;
      routine._resolve = null;
      resolve();
    }
  }

  /** @private */
  static _step(routine, dt) {
    const wait = routine.wait;
    if (!wait) {
      Coroutine._advance(routine, undefined, dt);
      return;
    }

    switch (wait.kind) {
      case "time":
        wait.remaining -= dt;
        if (wait.remaining <= 0) {
          const overflow = -wait.remaining;
          Coroutine._advance(routine, undefined, overflow);
        }
        break;
      case "frames":
        wait.remaining -= 1;
        if (wait.remaining <= 0) Coroutine._advance(routine, undefined, 0);
        break;
      case "until":
        if (wait.predicate()) Coroutine._advance(routine, undefined, 0);
        break;
      case "tween": {
        const t = wait.spec;
        t.elapsed += dt;
        const k =
          t.duration <= 0 ? 1 : Math.min(1, t.elapsed / t.duration);
        const eased = t.easing(k);
        t.onUpdate(t.from + (t.to - t.from) * eased);
        if (k >= 1) Coroutine._advance(routine, undefined, 0);
        break;
      }
      case "promise":
        if (wait.resolved) {
          Coroutine._advance(routine, wait.value, 0);
        }
        break;
      case "nested":
        if (wait.routine.done || wait.routine.cancelled) {
          Coroutine._advance(routine, undefined, 0);
        }
        break;
      default:
        Coroutine._advance(routine, undefined, dt);
    }
  }

  /** @private */
  static _advance(routine, sendValue, leftoverDt) {
    if (routine.cancelled || routine.done) return;
    let result;
    try {
      result = routine.iterator.next(sendValue);
    } catch (err) {
      console.error("[Coroutine] Error in coroutine:", err);
      routine.done = true;
      return;
    }
    if (result.done) {
      routine.done = true;
      return;
    }
    routine.wait = Coroutine._interpret(result.value, routine);
    if (routine.wait && routine.wait.kind === "time" && leftoverDt > 0) {
      Coroutine._step(routine, leftoverDt);
    }
  }

  /** @private */
  static _interpret(value, routine) {
    if (value == null) {
      return { kind: "time", remaining: 0 };
    }
    if (typeof value === "number") {
      return { kind: "time", remaining: value };
    }
    if (typeof value.then === "function") {
      const wait = { kind: "promise", resolved: false, value: undefined };
      value.then(
        (v) => {
          wait.resolved = true;
          wait.value = v;
        },
        () => {
          wait.resolved = true;
        }
      );
      return wait;
    }
    if (value.iterator && typeof value.cancel === "function") {
      return { kind: "nested", routine: value };
    }
    switch (value.__coroutine) {
      case "frames":
        return { kind: "frames", remaining: value.count };
      case "until":
        return { kind: "until", predicate: value.predicate };
      case "tween":
        return { kind: "tween", spec: value };
      default:
        return { kind: "time", remaining: 0 };
    }
  }
}

Coroutine._routines = [];

export default Coroutine;
