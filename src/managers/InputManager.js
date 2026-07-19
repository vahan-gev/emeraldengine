/**
 * Canonical W3C "standard gamepad" button layout, with vendor-neutral
 * (south/east/west/north) and vendor (Xbox a/b/x/y, PlayStation
 * cross/circle/square/triangle) aliases all pointing at the same index. This is
 * the table used when a pad reports `mapping === "standard"` (Xbox pads, most
 * controllers, and anything routed through Steam Input / XInput).
 */
const STANDARD_BUTTONS = {
  south: 0,
  a: 0,
  cross: 0,
  east: 1,
  b: 1,
  circle: 1,
  west: 2,
  x: 2,
  square: 2,
  north: 3,
  y: 3,
  triangle: 3,
  l1: 4,
  lb: 4,
  leftShoulder: 4,
  r1: 5,
  rb: 5,
  rightShoulder: 5,
  l2: 6,
  lt: 6,
  leftTrigger: 6,
  r2: 7,
  rt: 7,
  rightTrigger: 7,
  select: 8,
  back: 8,
  view: 8,
  share: 8,
  start: 9,
  menu: 9,
  options: 9,
  l3: 10,
  leftStick: 10,
  r3: 11,
  rightStick: 11,
  up: 12,
  dpadUp: 12,
  down: 13,
  dpadDown: 13,
  left: 14,
  dpadLeft: 14,
  right: 15,
  dpadRight: 15,
  home: 16,
  guide: 16,
};

const STANDARD_AXES = { leftX: 0, leftY: 1, rightX: 2, rightY: 3 };

const CUSTOM_MAPPINGS = [];

const BUILTIN_MAPPINGS = [
  {
    match: "logitech dual action",
    buttons: {
      west: 0,
      x: 0,
      square: 0,
      south: 1,
      a: 1,
      cross: 1,
      east: 2,
      b: 2,
      circle: 2,
      north: 3,
      y: 3,
      triangle: 3,
      l1: 4,
      lb: 4,
      r1: 5,
      rb: 5,
      l2: 6,
      lt: 6,
      r2: 7,
      rt: 7,
      select: 8,
      back: 8,
      start: 9,
      l3: 10,
      r3: 11,
    },
  },
  {
    match: "twin usb",
    buttons: {
      north: 0,
      y: 0,
      triangle: 0,
      east: 1,
      b: 1,
      circle: 1,
      south: 2,
      a: 2,
      cross: 2,
      west: 3,
      x: 3,
      square: 3,
      l2: 4,
      lt: 4,
      r2: 5,
      rt: 5,
      l1: 6,
      lb: 6,
      r1: 7,
      rb: 7,
      select: 8,
      back: 8,
      start: 9,
      l3: 10,
      r3: 11,
    },
  },
  {
    match: "8bitdo",
    buttons: {
      east: 0,
      b: 0,
      circle: 0,
      south: 1,
      a: 1,
      cross: 1,
      north: 3,
      y: 3,
      triangle: 3,
      west: 4,
      x: 4,
      square: 4,
      l1: 6,
      lb: 6,
      r1: 7,
      rb: 7,
      l2: 8,
      lt: 8,
      r2: 9,
      rt: 9,
      select: 10,
      back: 10,
      start: 11,
    },
  },
];

const STICK_DIRECTIONS = {
  leftStickLeft: ["leftX", -1],
  leftStickRight: ["leftX", 1],
  leftStickUp: ["leftY", -1],
  leftStickDown: ["leftY", 1],
  rightStickLeft: ["rightX", -1],
  rightStickRight: ["rightX", 1],
  rightStickUp: ["rightY", -1],
  rightStickDown: ["rightY", 1],
};

for (const b of BUILTIN_MAPPINGS) {
  CUSTOM_MAPPINGS.push({
    test: (id) => (id || "").toLowerCase().includes(b.match),
    buttons: { ...STANDARD_BUTTONS, ...b.buttons },
    axes: { ...STANDARD_AXES, ...(b.axes || {}) },
  });
}

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
class InputManager {
  /**
   * @method registerGamepadMapping
   * @description Registers a custom button/axis mapping for controllers whose
   * `mapping` is not "standard" (so their raw button indices differ). Match by
   * a substring of `gamepad.id` (case-insensitive), a RegExp, or a predicate.
   * @param {string|RegExp|Function} match - id matcher
   * @param {Object} mapping - { buttons:{name:index}, axes:{name:index} };
   *   merged over the standard table, so you only specify what differs.
   */
  static registerGamepadMapping(match, mapping = {}) {
    const test =
      typeof match === "function"
        ? match
        : match instanceof RegExp
          ? (id) => match.test(id)
          : (id) =>
              (id || "").toLowerCase().includes(String(match).toLowerCase());
    CUSTOM_MAPPINGS.unshift({
      test,
      buttons: { ...STANDARD_BUTTONS, ...(mapping.buttons || {}) },
      axes: { ...STANDARD_AXES, ...(mapping.axes || {}) },
    });
  }

  constructor(options = {}) {
    this.target =
      options.target || (typeof window !== "undefined" ? window : null);
    this.actions = new Map();
    this.down = new Set();
    this.prevDown = new Set();
    this.mouse = { x: 0, y: 0, buttons: new Set() };
    this.touches = [];
    this.gamepads = [];

    this.gamepadDeadzone = options.gamepadDeadzone ?? 0.3;
    this.gamepadCurve = options.gamepadCurve ?? 1;
    this.stickPressThreshold = options.stickPressThreshold ?? 0.5;
    /** @private */
    this._gamepadTokens = new Set();
    /** @private */
    this._connectHandlers = [];
    /** @private */
    this._disconnectHandlers = [];
    /** @private */
    this._connected = new Map();

    /** @private */
    this._onKeyDown = (e) => this.down.add(this._normKey(e.key));
    /** @private */
    this._onKeyUp = (e) => this.down.delete(this._normKey(e.key));
    /** @private */
    this._onMouseDown = (e) => {
      this.down.add(`mouse:${e.button}`);
      this.mouse.buttons.add(e.button);
    };
    /** @private */
    this._onMouseUp = (e) => {
      this.down.delete(`mouse:${e.button}`);
      this.mouse.buttons.delete(e.button);
    };
    /** @private */
    this._onMouseMove = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    };
    /** @private */
    this._onTouch = (e) => {
      this.touches = Array.from(e.touches || []).map((t) => ({
        x: t.clientX,
        y: t.clientY,
        id: t.identifier,
      }));
    };
    /** @private */
    this._onGamepadConnected = (e) => {
      const gp = e.gamepad;
      if (!gp) return;
      const info = this._infoFromPad(gp);
      this._connected.set(gp.index, info);
      for (const h of this._connectHandlers) h(info);
    };
    /** @private */
    this._onGamepadDisconnected = (e) => {
      const gp = e.gamepad;
      if (!gp) return;
      const info = this._connected.get(gp.index) || this._infoFromPad(gp);
      this._connected.delete(gp.index);
      for (const h of this._disconnectHandlers) h(info);
    };

    if (this.target) {
      this.target.addEventListener("keydown", this._onKeyDown);
      this.target.addEventListener("keyup", this._onKeyUp);
      this.target.addEventListener("mousedown", this._onMouseDown);
      this.target.addEventListener("mouseup", this._onMouseUp);
      this.target.addEventListener("mousemove", this._onMouseMove);
      this.target.addEventListener("touchstart", this._onTouch);
      this.target.addEventListener("touchmove", this._onTouch);
      this.target.addEventListener("touchend", this._onTouch);
      this.target.addEventListener(
        "gamepadconnected",
        this._onGamepadConnected
      );
      this.target.addEventListener(
        "gamepaddisconnected",
        this._onGamepadDisconnected
      );
    }
  }

  /** @private */
  _normKey(key) {
    return key && key.length <= 1 ? key.toLowerCase() : key;
  }

  /**
   * @method mapAction
   * @description Binds an action name to one or more input tokens (keys,
   * "mouse:0", or any gamepad token above).
   * @param {string} name - Action name
   * @param {string[]} tokens - Input tokens
   * @returns {InputManager} - this
   */
  mapAction(name, tokens) {
    this.actions.set(
      name,
      tokens.map((t) => this._normKey(t))
    );
    return this;
  }

  /** @private */
  _tokensFor(actionOrToken) {
    return this.actions.get(actionOrToken) || [this._normKey(actionOrToken)];
  }

  /** @private */
  _tokenDown(token) {
    if (this.down.has(token)) return true;
    if (this._gamepadTokens.has(token)) return true;
    if (token.startsWith("gamepad:")) {
      const idx = parseInt(token.slice(8), 10);
      const gp = this.gamepads[0];
      return !!(gp && gp.buttons[idx] && gp.buttons[idx].pressed);
    }
    return false;
  }

  /**
   * @method isDown
   * @description Whether the action (or raw token) is currently held.
   */
  isDown(actionOrToken) {
    return this._tokensFor(actionOrToken).some((t) => this._tokenDown(t));
  }

  /**
   * @method justPressed
   * @description Whether the action became pressed this frame.
   */
  justPressed(actionOrToken) {
    return this._tokensFor(actionOrToken).some(
      (t) => this.down.has(t) && !this.prevDown.has(t)
    );
  }

  /**
   * @method justReleased
   * @description Whether the action was released this frame.
   */
  justReleased(actionOrToken) {
    return this._tokensFor(actionOrToken).some(
      (t) => !this.down.has(t) && this.prevDown.has(t)
    );
  }

  /**
   * @method getAxis
   * @description Returns -1/0/+1 based on two opposing actions.
   */
  getAxis(negative, positive) {
    return (this.isDown(positive) ? 1 : 0) - (this.isDown(negative) ? 1 : 0);
  }

  /**
   * @method getGamepad
   * @description Returns the polled gamepad at an index (or null).
   */
  getGamepad(index = 0) {
    return this.gamepads[index] || null;
  }

  /**
   * @method setGamepadDeadzone
   * @description Sets the analog deadzone (0..1) for axes and trigger buttons.
   * @returns {InputManager} - this
   */
  setGamepadDeadzone(dz) {
    this.gamepadDeadzone = dz;
    return this;
  }

  /**
   * @method setGamepadCurve
   * @description Sets the response-curve exponent applied to deadzoned analog
   * values: 1 = linear (default), >1 = softer near center for fine aiming.
   * @returns {InputManager} - this
   */
  setGamepadCurve(exp) {
    this.gamepadCurve = exp;
    return this;
  }

  /**
   * @method _rescaleAxis
   * @description Deadzone + rescale + curve for a single axis value. Unlike a
   * hard cutoff, the output ramps smoothly from 0 at the deadzone edge to ±1
   * at full deflection (no jump, and the full range stays reachable).
   * @private
   */
  _rescaleAxis(v, dz = this.gamepadDeadzone, curve = this.gamepadCurve) {
    const a = Math.abs(v);
    if (a < dz) return 0;
    let t = Math.min(1, (a - dz) / (1 - dz || 1));
    if (curve !== 1) t = Math.pow(t, curve);
    return v < 0 ? -t : t;
  }

  /**
   * @method _buttonMapFor
   * @description Resolves the button-name → index table for a gamepad: a
   * registered custom mapping (matched by id) wins; otherwise the standard
   * table is used (also as the best-effort fallback for unknown non-standard
   * pads).
   * @private
   */
  _buttonMapFor(gp) {
    if (gp.mapping !== "standard") {
      const id = gp.id || "";
      for (const m of CUSTOM_MAPPINGS) {
        if (m.test(id)) return m.buttons;
      }
    }
    return STANDARD_BUTTONS;
  }

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
  getGamepadAxis(axisIndex, padIndex = 0) {
    const gp = this.gamepads[padIndex];
    if (!gp || !gp.axes) return 0;
    return this._rescaleAxis(gp.axes[axisIndex] || 0);
  }

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
  getGamepadStick(side = "left", padIndex = 0, opts = {}) {
    const gp = this.gamepads[padIndex];
    if (!gp || !gp.axes) return { x: 0, y: 0, magnitude: 0, angle: 0 };
    const map = this._axisMapFor(gp);
    const ax = side === "right" ? map.rightX : map.leftX;
    const ay = side === "right" ? map.rightY : map.leftY;
    const rx = gp.axes[ax] || 0;
    const ry = gp.axes[ay] || 0;
    const dz = opts.deadzone ?? this.gamepadDeadzone;
    const curve = opts.curve ?? this.gamepadCurve;

    const mag = Math.hypot(rx, ry);
    if (mag < dz) return { x: 0, y: 0, magnitude: 0, angle: 0 };
    let t = Math.min(1, (mag - dz) / (1 - dz || 1));
    if (curve !== 1) t = Math.pow(t, curve);
    const s = t / mag;
    const x = rx * s;
    const y = (opts.invertY ? -ry : ry) * s;
    return { x, y, magnitude: t, angle: Math.atan2(y, x) };
  }

  /**
   * @method _axisMapFor
   * @description Axis-name table for a pad (custom/built-in mapping wins for
   * non-standard pads, else the standard table).
   * @private
   */
  _axisMapFor(gp) {
    if (gp.mapping !== "standard") {
      const id = gp.id || "";
      for (const m of CUSTOM_MAPPINGS) {
        if (m.test(id)) return m.axes;
      }
    }
    return STANDARD_AXES;
  }

  /**
   * @method getGamepadButton
   * @description Looks up a button by semantic name (e.g. "south", "a", "r1",
   * "start", "dpadLeft") or raw index through the pad's active mapping.
   * @param {string|number} name
   * @param {number} [padIndex=0]
   * @returns {{pressed:boolean, value:number, index:number}}
   */
  getGamepadButton(name, padIndex = 0) {
    const gp = this.gamepads[padIndex];
    if (!gp || !gp.buttons) return { pressed: false, value: 0, index: -1 };
    const map = this._buttonMapFor(gp);
    const idx = typeof name === "number" ? name : map[name];
    if (idx == null) return { pressed: false, value: 0, index: -1 };
    const btn = gp.buttons[idx];
    const value = btn ? btn.value || 0 : 0;
    return {
      pressed: !!(btn && (btn.pressed || value > this.gamepadDeadzone)),
      value,
      index: idx,
    };
  }

  /**
   * @method getGamepadTrigger
   * @description Returns the analog value (0..1) of a trigger.
   * @param {"left"|"right"} [side="left"]
   * @param {number} [padIndex=0]
   * @returns {number}
   */
  getGamepadTrigger(side = "left", padIndex = 0) {
    return this.getGamepadButton(side === "right" ? "r2" : "l2", padIndex)
      .value;
  }

  /**
   * @method rumble
   * @description Plays a vibration effect on a pad (where supported).
   * @param {number} [padIndex=0]
   * @param {Object} [opts] - { duration=200, strong=1, weak=1 }
   * @returns {Promise|undefined}
   */
  rumble(padIndex = 0, opts = {}) {
    const gp = this.gamepads[padIndex];
    const act =
      gp &&
      (gp.vibrationActuator || (gp.hapticActuators && gp.hapticActuators[0]));
    if (!act) return;
    const { duration = 200, strong = 1, weak = 1 } = opts;
    if (typeof act.playEffect === "function") {
      return act.playEffect("dual-rumble", {
        duration,
        strongMagnitude: strong,
        weakMagnitude: weak,
        startDelay: 0,
      });
    }
    if (typeof act.pulse === "function")
      return act.pulse(Math.max(strong, weak), duration);
  }

  /**
   * @method onGamepadConnected
   * @description Registers a callback fired when a pad connects (also called for
   * pads already connected at registration time). Receives an info object.
   * @param {Function} cb
   * @returns {InputManager} - this
   */
  onGamepadConnected(cb) {
    this._connectHandlers.push(cb);
    for (const info of this.getConnectedGamepads()) cb(info);
    return this;
  }

  /**
   * @method onGamepadDisconnected
   * @description Registers a callback fired when a pad disconnects.
   * @returns {InputManager} - this
   */
  onGamepadDisconnected(cb) {
    this._disconnectHandlers.push(cb);
    return this;
  }

  /** @private */
  _infoFromPad(gp) {
    return {
      index: gp.index,
      id: gp.id || "",
      mapping: gp.mapping || "",
      buttonCount: (gp.buttons || []).length,
      axesCount: (gp.axes || []).length,
      standard: gp.mapping === "standard",
    };
  }

  /**
   * @method getGamepadInfo
   * @description Diagnostic info for a connected pad (id, mapping, counts).
   * @param {number} [padIndex=0]
   * @returns {Object|null}
   */
  getGamepadInfo(padIndex = 0) {
    const gp = this.gamepads[padIndex];
    return gp ? this._infoFromPad(gp) : null;
  }

  /**
   * @method getConnectedGamepads
   * @description Info for every currently polled pad.
   * @returns {Object[]}
   */
  getConnectedGamepads() {
    return this.gamepads.filter(Boolean).map((gp) => this._infoFromPad(gp));
  }

  /**
   * @method isGamepadConnected
   * @returns {boolean}
   */
  isGamepadConnected(padIndex = 0) {
    return !!this.gamepads[padIndex];
  }

  /**
   * @method getPressedButtons
   * @description Diagnostic: raw indices of all currently pressed buttons on a
   * pad. Handy for discovering an unknown controller's layout.
   * @param {number} [padIndex=0]
   * @returns {number[]}
   */
  getPressedButtons(padIndex = 0) {
    const gp = this.gamepads[padIndex];
    if (!gp || !gp.buttons) return [];
    const out = [];
    for (let b = 0; b < gp.buttons.length; b++) {
      const btn = gp.buttons[b];
      if (btn && (btn.pressed || (btn.value || 0) > this.gamepadDeadzone))
        out.push(b);
    }
    return out;
  }

  /**
   * @method _decodeHat
   * @description Some non-standard pads report the d-pad as an 8-way "hat" on a
   * single axis instead of buttons 12-15. When a pad is non-standard and exposes
   * an extra (odd) trailing axis, decode it into d-pad direction tokens.
   * @private
   */
  _decodeHat(gp, i, set) {
    if (gp.mapping === "standard") return;
    const axes = gp.axes || [];
    if (axes.length < 5 || axes.length % 2 === 0) return;
    const v = axes[axes.length - 1];
    if (v == null || v > 1.2 || v < -1.2) return;
    const dirs = [
      ["dpadUp"],
      ["dpadUp", "dpadRight"],
      ["dpadRight"],
      ["dpadDown", "dpadRight"],
      ["dpadDown"],
      ["dpadDown", "dpadLeft"],
      ["dpadLeft"],
      ["dpadUp", "dpadLeft"],
    ];
    const bucket = Math.round((v + 1) * 3.5);
    const names = dirs[Math.max(0, Math.min(7, bucket))];
    for (const n of names) set.add(`pad:${i}:${n}`);
  }

  /**
   * @method _collectGamepadTokens
   * @description Rebuilds the active gamepad token set (raw indices, semantic
   * names via the pad's mapping, d-pad, and axis directions) for every connected
   * pad, so gamepad input flows through the same down/justPressed machinery as
   * the keyboard.
   * @private
   */
  _collectGamepadTokens() {
    const set = this._gamepadTokens;
    set.clear();
    const dz = this.gamepadDeadzone;

    for (let i = 0; i < this.gamepads.length; i++) {
      const gp = this.gamepads[i];
      if (!gp) continue;
      const map = this._buttonMapFor(gp);
      const buttons = gp.buttons || [];

      for (let b = 0; b < buttons.length; b++) {
        const btn = buttons[b];
        if (btn && (btn.pressed || (btn.value || 0) > dz)) {
          set.add(`pad:${i}:${b}`);
          if (i === 0) set.add(`gamepad:${b}`);
        }
      }
      for (const name in map) {
        const btn = buttons[map[name]];
        if (btn && (btn.pressed || (btn.value || 0) > dz))
          set.add(`pad:${i}:${name}`);
      }
      this._decodeHat(gp, i, set);

      const axes = gp.axes || [];
      for (let a = 0; a < axes.length; a++) {
        const v = axes[a] || 0;
        if (v <= -dz) set.add(`pad:${i}:axis${a}-`);
        else if (v >= dz) set.add(`pad:${i}:axis${a}+`);
      }

      const axisMap = this._axisMapFor(gp);
      const press = this.stickPressThreshold;
      for (const name in STICK_DIRECTIONS) {
        const [axisName, sign] = STICK_DIRECTIONS[name];
        const idx = axisMap[axisName];
        if (idx == null || axes[idx] == null) continue;
        const v = this._rescaleAxis(axes[idx]);
        if (sign * v >= press) set.add(`pad:${i}:${name}`);
      }
    }
    return set;
  }

  /**
   * @method update
   * @description Polls gamepads and advances edge-detection state. Call once
   * per frame after reading input.
   */
  update() {
    if (typeof navigator !== "undefined" && navigator.getGamepads) {
      this.gamepads = Array.from(navigator.getGamepads()).filter(Boolean);
    }
    this.prevDown = new Set(this.down);
    for (const t of this._gamepadTokens) this.down.delete(t);
    this._collectGamepadTokens();
    for (const t of this._gamepadTokens) this.down.add(t);
  }

  /**
   * @method destroy
   * @description Removes all event listeners.
   */
  destroy() {
    if (!this.target) return;
    this.target.removeEventListener("keydown", this._onKeyDown);
    this.target.removeEventListener("keyup", this._onKeyUp);
    this.target.removeEventListener("mousedown", this._onMouseDown);
    this.target.removeEventListener("mouseup", this._onMouseUp);
    this.target.removeEventListener("mousemove", this._onMouseMove);
    this.target.removeEventListener("touchstart", this._onTouch);
    this.target.removeEventListener("touchmove", this._onTouch);
    this.target.removeEventListener("touchend", this._onTouch);
    this.target.removeEventListener(
      "gamepadconnected",
      this._onGamepadConnected
    );
    this.target.removeEventListener(
      "gamepaddisconnected",
      this._onGamepadDisconnected
    );
  }
}

export default InputManager;
