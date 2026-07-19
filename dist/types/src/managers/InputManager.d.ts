export default InputManager;
/**
 * @class InputManager
 * @description Unified, pollable input: keyboard, mouse, touch, and full
 * gamepad support (analog sticks/triggers, semantic button names, rumble,
 * connect events, and per-controller mapping), with rebindable named actions.
 * Call `update()` once per frame so `justPressed`/`justReleased` edge queries
 * work for every device — including the gamepad.
 *
 * Gamepad tokens (usable anywhere a key token is, including in mapAction and
 * justPressed) — `<i>` is the pad index:
 *   "pad:<i>:south" / "pad:<i>:a"      - face buttons (also east/b, west/x, north/y)
 *   "pad:<i>:l1" / "pad:<i>:r2" ...    - shoulders / triggers
 *   "pad:<i>:start" / "pad:<i>:select" - center buttons
 *   "pad:<i>:dpadLeft" ...             - d-pad (works via buttons or a hat axis)
 *   "pad:<i>:<n>"                      - raw button index (mapping-independent)
 *   "pad:<i>:axis<n>+" / "axis<n>-"    - analog axis past the deadzone
 *   "pad:<i>:leftStickUp" / "Down" / "Left" / "Right" - stick as a d-pad
 *   "pad:<i>:rightStickUp" ...         - (threshold: stickPressThreshold)
 *   "gamepad:<n>"                      - legacy: raw button <n> on pad 0
 * Names resolve through the active mapping, so "pad:0:south" is the bottom face
 * button regardless of whether the pad reports Xbox or PlayStation ordering.
 *
 * @example
 * const input = new InputManager();
 * input.mapAction("jump", ["Space", " ", "pad:0:south"]);
 * input.mapAction("left", ["a", "ArrowLeft", "pad:0:dpadLeft"]);
 * input.onGamepadConnected((info) => console.log("pad:", info.id, info.mapping));
 * // in the loop:
 * if (input.justPressed("jump")) { player.jump(); input.rumble(0, { duration: 120 }); }
 * const { x } = input.getGamepadStick("left");   // analog, deadzoned
 * input.update();
 */
declare class InputManager {
    /**
     * @method registerGamepadMapping
     * @description Registers a custom button/axis mapping for controllers whose
     * `mapping` is not "standard" (so their raw button indices differ). Match by
     * a substring of `gamepad.id` (case-insensitive), a RegExp, or a predicate.
     * @param {string|RegExp|Function} match - id matcher
     * @param {Object} mapping - { buttons:{name:index}, axes:{name:index} };
     *   merged over the standard table, so you only specify what differs.
     */
    static registerGamepadMapping(match: string | RegExp | Function, mapping?: any): void;
    constructor(options?: {});
    target: any;
    actions: Map<any, any>;
    down: Set<any>;
    prevDown: Set<any>;
    mouse: {
        x: number;
        y: number;
        buttons: Set<any>;
    };
    touches: any[];
    gamepads: any[];
    gamepadDeadzone: any;
    gamepadCurve: any;
    stickPressThreshold: any;
    /** @private */
    private _gamepadTokens;
    /** @private */
    private _connectHandlers;
    /** @private */
    private _disconnectHandlers;
    /** @private */
    private _connected;
    /** @private */
    private _onKeyDown;
    /** @private */
    private _onKeyUp;
    /** @private */
    private _onMouseDown;
    /** @private */
    private _onMouseUp;
    /** @private */
    private _onMouseMove;
    /** @private */
    private _onTouch;
    /** @private */
    private _onGamepadConnected;
    /** @private */
    private _onGamepadDisconnected;
    /** @private */
    private _normKey;
    /**
     * @method mapAction
     * @description Binds an action name to one or more input tokens (keys,
     * "mouse:0", or any gamepad token above).
     * @param {string} name - Action name
     * @param {string[]} tokens - Input tokens
     * @returns {InputManager} - this
     */
    mapAction(name: string, tokens: string[]): InputManager;
    /** @private */
    private _tokensFor;
    /** @private */
    private _tokenDown;
    /**
     * @method isDown
     * @description Whether the action (or raw token) is currently held.
     */
    isDown(actionOrToken: any): any;
    /**
     * @method justPressed
     * @description Whether the action became pressed this frame.
     */
    justPressed(actionOrToken: any): any;
    /**
     * @method justReleased
     * @description Whether the action was released this frame.
     */
    justReleased(actionOrToken: any): any;
    /**
     * @method getAxis
     * @description Returns -1/0/+1 based on two opposing actions.
     */
    getAxis(negative: any, positive: any): number;
    /**
     * @method getGamepad
     * @description Returns the polled gamepad at an index (or null).
     */
    getGamepad(index?: number): any;
    /**
     * @method setGamepadDeadzone
     * @description Sets the analog deadzone (0..1) for axes and trigger buttons.
     * @returns {InputManager} - this
     */
    setGamepadDeadzone(dz: any): InputManager;
    /**
     * @method setGamepadCurve
     * @description Sets the response-curve exponent applied to deadzoned analog
     * values: 1 = linear (default), >1 = softer near center for fine aiming.
     * @returns {InputManager} - this
     */
    setGamepadCurve(exp: any): InputManager;
    /**
     * @method _rescaleAxis
     * @description Deadzone + rescale + curve for a single axis value. Unlike a
     * hard cutoff, the output ramps smoothly from 0 at the deadzone edge to ±1
     * at full deflection (no jump, and the full range stays reachable).
     * @private
     */
    private _rescaleAxis;
    /**
     * @method _buttonMapFor
     * @description Resolves the button-name → index table for a gamepad: a
     * registered custom mapping (matched by id) wins; otherwise the standard
     * table is used (also as the best-effort fallback for unknown non-standard
     * pads).
     * @private
     */
    private _buttonMapFor;
    /**
     * @method getGamepadAxis
     * @description Returns a deadzoned analog axis value (-1..1). The value is
     * RESCALED past the deadzone (0 at the edge, ±1 at full deflection) and runs
     * through the response curve, so there is no jump at the threshold. Standard
     * mapping: axis 0/1 = left stick X/Y, 2/3 = right stick X/Y.
     * @param {number} axisIndex
     * @param {number} [padIndex=0]
     * @returns {number}
     */
    getGamepadAxis(axisIndex: number, padIndex?: number): number;
    /**
     * @method getGamepadStick
     * @description Returns the left or right stick with a RADIAL deadzone: the
     * deadzone applies to the stick's distance from center (not per axis), so
     * diagonals aren't clipped square and direction is preserved exactly. The
     * magnitude is rescaled to use the full 0..1 range and shaped by the
     * response curve.
     * @param {"left"|"right"} [side="left"]
     * @param {number} [padIndex=0]
     * @param {Object} [opts] - { deadzone, curve, invertY } overrides. invertY
     *   flips the browser's y-down convention so up = +1.
     * @returns {{x:number, y:number, magnitude:number, angle:number}}
     */
    getGamepadStick(side?: "left" | "right", padIndex?: number, opts?: any): {
        x: number;
        y: number;
        magnitude: number;
        angle: number;
    };
    /**
     * @method _axisMapFor
     * @description Axis-name table for a pad (custom/built-in mapping wins for
     * non-standard pads, else the standard table).
     * @private
     */
    private _axisMapFor;
    /**
     * @method getGamepadButton
     * @description Looks up a button by semantic name (e.g. "south", "a", "r1",
     * "start", "dpadLeft") or raw index through the pad's active mapping.
     * @param {string|number} name
     * @param {number} [padIndex=0]
     * @returns {{pressed:boolean, value:number, index:number}}
     */
    getGamepadButton(name: string | number, padIndex?: number): {
        pressed: boolean;
        value: number;
        index: number;
    };
    /**
     * @method getGamepadTrigger
     * @description Returns the analog value (0..1) of a trigger.
     * @param {"left"|"right"} [side="left"]
     * @param {number} [padIndex=0]
     * @returns {number}
     */
    getGamepadTrigger(side?: "left" | "right", padIndex?: number): number;
    /**
     * @method rumble
     * @description Plays a vibration effect on a pad (where supported).
     * @param {number} [padIndex=0]
     * @param {Object} [opts] - { duration=200, strong=1, weak=1 }
     * @returns {Promise|undefined}
     */
    rumble(padIndex?: number, opts?: any): Promise<any> | undefined;
    /**
     * @method onGamepadConnected
     * @description Registers a callback fired when a pad connects (also called for
     * pads already connected at registration time). Receives an info object.
     * @param {Function} cb
     * @returns {InputManager} - this
     */
    onGamepadConnected(cb: Function): InputManager;
    /**
     * @method onGamepadDisconnected
     * @description Registers a callback fired when a pad disconnects.
     * @returns {InputManager} - this
     */
    onGamepadDisconnected(cb: any): InputManager;
    /** @private */
    private _infoFromPad;
    /**
     * @method getGamepadInfo
     * @description Diagnostic info for a connected pad (id, mapping, counts).
     * @param {number} [padIndex=0]
     * @returns {Object|null}
     */
    getGamepadInfo(padIndex?: number): any | null;
    /**
     * @method getConnectedGamepads
     * @description Info for every currently polled pad.
     * @returns {Object[]}
     */
    getConnectedGamepads(): any[];
    /**
     * @method isGamepadConnected
     * @returns {boolean}
     */
    isGamepadConnected(padIndex?: number): boolean;
    /**
     * @method getPressedButtons
     * @description Diagnostic: raw indices of all currently pressed buttons on a
     * pad. Handy for discovering an unknown controller's layout.
     * @param {number} [padIndex=0]
     * @returns {number[]}
     */
    getPressedButtons(padIndex?: number): number[];
    /**
     * @method _decodeHat
     * @description Some non-standard pads report the d-pad as an 8-way "hat" on a
     * single axis instead of buttons 12-15. When a pad is non-standard and exposes
     * an extra (odd) trailing axis, decode it into d-pad direction tokens.
     * @private
     */
    private _decodeHat;
    /**
     * @method _collectGamepadTokens
     * @description Rebuilds the active gamepad token set (raw indices, semantic
     * names via the pad's mapping, d-pad, and axis directions) for every connected
     * pad, so gamepad input flows through the same down/justPressed machinery as
     * the keyboard.
     * @private
     */
    private _collectGamepadTokens;
    /**
     * @method update
     * @description Polls gamepads and advances edge-detection state. Call once
     * per frame after reading input.
     */
    update(): void;
    /**
     * @method destroy
     * @description Removes all event listeners.
     */
    destroy(): void;
}
