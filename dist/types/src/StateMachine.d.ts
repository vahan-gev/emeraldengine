export default StateMachine;
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
declare class StateMachine {
    states: Map<any, any>;
    current: any;
    currentName: any;
    previousName: any;
    /**
     * @method add
     * @description Registers a state.
     * @param {string} name - State name
     * @param {{enter?:Function, update?:Function, exit?:Function}} handlers
     * @returns {StateMachine} - this
     */
    add(name: string, handlers: {
        enter?: Function;
        update?: Function;
        exit?: Function;
    }): StateMachine;
    /**
     * @method set
     * @description Transitions to a state, running exit/enter handlers. Re-entering
     * the same state is a no-op unless `force` is true.
     * @param {string} name - Target state name
     * @param {boolean} [force] - Allow re-entering the current state
     * @returns {StateMachine} - this
     */
    set(name: string, force?: boolean): StateMachine;
    /**
     * @method update
     * @description Runs the current state's update handler.
     * @param {number} dt - Seconds since the last frame
     */
    update(dt: number): void;
    /**
     * @method is
     * @description Whether the given state is current.
     * @param {string} name
     * @returns {boolean}
     */
    is(name: string): boolean;
}
