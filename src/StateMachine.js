/**
 * @class StateMachine
 * @description A lightweight finite state machine for entity AI, animation
 * states, game flow, etc. Each state can define `enter`, `update(dt)`, and
 * `exit` handlers. Drive it from a Behaviour's update().
 *
 * @example
 * const fsm = new StateMachine();
 * fsm.add("idle", {
 *   update: (dt, sm) => { if (seesPlayer) sm.set("chase"); },
 * });
 * fsm.add("chase", {
 *   enter: () => playRoarSound(),
 *   update: (dt, sm) => moveTowardPlayer(dt),
 * });
 * fsm.set("idle");
 * // in update(dt): fsm.update(dt);
 */
class StateMachine {
  constructor() {
    this.states = new Map();
    this.current = null;
    this.currentName = null;
    this.previousName = null;
  }

  /**
   * @method add
   * @description Registers a state.
   * @param {string} name - State name
   * @param {{enter?:Function, update?:Function, exit?:Function}} handlers
   * @returns {StateMachine} - this
   */
  add(name, handlers) {
    this.states.set(name, handlers || {});
    return this;
  }

  /**
   * @method set
   * @description Transitions to a state, running exit/enter handlers. Re-entering
   * the same state is a no-op unless `force` is true.
   * @param {string} name - Target state name
   * @param {boolean} [force] - Allow re-entering the current state
   * @returns {StateMachine} - this
   */
  set(name, force = false) {
    if (this.currentName === name && !force) return this;
    if (!this.states.has(name)) {
      console.warn(`[StateMachine] > Unknown state "${name}"`);
      return this;
    }

    if (this.current && this.current.exit) this.current.exit(this);
    this.previousName = this.currentName;
    this.currentName = name;
    this.current = this.states.get(name);
    if (this.current.enter) this.current.enter(this);
    return this;
  }

  /**
   * @method update
   * @description Runs the current state's update handler.
   * @param {number} dt - Seconds since the last frame
   */
  update(dt) {
    if (this.current && this.current.update) this.current.update(dt, this);
  }

  /**
   * @method is
   * @description Whether the given state is current.
   * @param {string} name
   * @returns {boolean}
   */
  is(name) {
    return this.currentName === name;
  }
}

export default StateMachine;
