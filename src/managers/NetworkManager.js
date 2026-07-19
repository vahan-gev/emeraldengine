import Interpolator from "../Interpolator.js";

/**
 * @class NetworkManager
 * @description A thin, optional multiplayer layer over Colyseus. `colyseus.js`
 * is an optional peer dependency and is imported dynamically, so the engine has
 * no hard dependency on it — games that don't use networking never load it.
 *
 * It wraps connection/room lifecycle, exposes a small event API
 * (onStateChange / onMessage / onAdd / onRemove / onLeave), and bundles an
 * {@link Interpolator} so remote entities can be rendered smoothly.
 *
 * @example
 * const net = new NetworkManager();
 * await net.connect("wss://my-server");
 * const room = await net.join("arena", { name: "P1" });
 * net.onMessage("hit", (msg) => applyHit(msg));
 * net.onStateChange((state) => {
 *   for (const [id, p] of state.players) net.interpolator.push(id, p, net.now());
 * });
 * // each frame:
 * const pos = net.interpolator.sample(remoteId, net.now());
 */
class NetworkManager {
  constructor(options = {}) {
    this.client = null;
    this.room = null;
    this.interpolator = new Interpolator(options.interpolation || {});
    /** @private */
    this._messageHandlers = new Map();
    /** @private */
    this._stateHandlers = [];
    /** @private */
    this._leaveHandlers = [];
    /** @private */
    this._startTime = NetworkManager._now();
  }

  /**
   * @method connect
   * @description Dynamically imports colyseus.js and creates a Client.
   * @param {string} endpoint - The server endpoint (e.g. "wss://host:2567")
   * @returns {Promise<NetworkManager>} - this
   */
  async connect(endpoint) {
    let colyseus;
    try {
      colyseus = await import("colyseus.js");
    } catch (err) {
      throw new Error(
        "[NetworkManager] colyseus.js is not installed. Run `npm install colyseus.js` to use networking."
      );
    }
    const Client =
      colyseus.Client || (colyseus.default && colyseus.default.Client);
    this.client = new Client(endpoint);
    return this;
  }

  /**
   * @method join
   * @description Joins (or creates) a room by name and wires up the event hooks.
   * @param {string} roomName - The room name
   * @param {Object} [options] - Join options forwarded to the server
   * @returns {Promise<Object>} - The joined room
   */
  async join(roomName, options = {}) {
    if (!this.client) {
      throw new Error("[NetworkManager] Call connect() before join().");
    }
    this.room = await this.client.joinOrCreate(roomName, options);
    this._wireRoom(this.room);
    return this.room;
  }

  /** @private */
  _wireRoom(room) {
    if (typeof room.onStateChange === "function") {
      room.onStateChange((state) => {
        for (const handler of this._stateHandlers) handler(state);
      });
    }
    if (typeof room.onLeave === "function") {
      room.onLeave((code) => {
        for (const handler of this._leaveHandlers) handler(code);
      });
    }
    if (typeof room.onMessage === "function") {
      for (const [type, handlers] of this._messageHandlers) {
        room.onMessage(type, (payload) => handlers.forEach((h) => h(payload)));
      }
    }
  }

  /**
   * @method onStateChange
   * @description Registers a handler for full room-state updates.
   */
  onStateChange(handler) {
    this._stateHandlers.push(handler);
    return this;
  }

  /**
   * @method onMessage
   * @description Registers a handler for a server message type.
   */
  onMessage(type, handler) {
    if (!this._messageHandlers.has(type)) {
      this._messageHandlers.set(type, []);
      if (this.room && typeof this.room.onMessage === "function") {
        this.room.onMessage(type, (payload) =>
          this._messageHandlers.get(type).forEach((h) => h(payload))
        );
      }
    }
    this._messageHandlers.get(type).push(handler);
    return this;
  }

  /**
   * @method onLeave
   * @description Registers a handler invoked when the room is left.
   */
  onLeave(handler) {
    this._leaveHandlers.push(handler);
    return this;
  }

  /**
   * @method send
   * @description Sends a typed message to the server.
   */
  send(type, payload) {
    if (this.room && typeof this.room.send === "function") {
      this.room.send(type, payload);
    }
    return this;
  }

  /**
   * @method now
   * @description Seconds since this manager was created — a convenient clock for
   * feeding the interpolator.
   * @returns {number}
   */
  now() {
    return (NetworkManager._now() - this._startTime) / 1000;
  }

  /**
   * @method leave
   * @description Leaves the current room.
   */
  async leave() {
    if (this.room && typeof this.room.leave === "function") {
      await this.room.leave();
    }
    this.room = null;
  }

  /**
   * @method sessionId
   * @returns {string|null} - This client's session id, if joined.
   */
  get sessionId() {
    return this.room ? this.room.sessionId : null;
  }

  /** @private */
  static _now() {
    return typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
  }
}

export default NetworkManager;
