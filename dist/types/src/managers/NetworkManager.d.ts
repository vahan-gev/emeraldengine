export default NetworkManager;
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
declare class NetworkManager {
    /** @private */
    private static _now;
    constructor(options?: {});
    client: import("colyseus.js").Client;
    room: import("colyseus.js").Room<any>;
    interpolator: Interpolator;
    /** @private */
    private _messageHandlers;
    /** @private */
    private _stateHandlers;
    /** @private */
    private _leaveHandlers;
    /** @private */
    private _startTime;
    /**
     * @method connect
     * @description Dynamically imports colyseus.js and creates a Client.
     * @param {string} endpoint - The server endpoint (e.g. "wss://host:2567")
     * @returns {Promise<NetworkManager>} - this
     */
    connect(endpoint: string): Promise<NetworkManager>;
    /**
     * @method join
     * @description Joins (or creates) a room by name and wires up the event hooks.
     * @param {string} roomName - The room name
     * @param {Object} [options] - Join options forwarded to the server
     * @returns {Promise<Object>} - The joined room
     */
    join(roomName: string, options?: any): Promise<any>;
    /** @private */
    private _wireRoom;
    /**
     * @method onStateChange
     * @description Registers a handler for full room-state updates.
     */
    onStateChange(handler: any): this;
    /**
     * @method onMessage
     * @description Registers a handler for a server message type.
     */
    onMessage(type: any, handler: any): this;
    /**
     * @method onLeave
     * @description Registers a handler invoked when the room is left.
     */
    onLeave(handler: any): this;
    /**
     * @method send
     * @description Sends a typed message to the server.
     */
    send(type: any, payload: any): this;
    /**
     * @method now
     * @description Seconds since this manager was created — a convenient clock for
     * feeding the interpolator.
     * @returns {number}
     */
    now(): number;
    /**
     * @method leave
     * @description Leaves the current room.
     */
    leave(): Promise<void>;
    /**
     * @method sessionId
     * @returns {string|null} - This client's session id, if joined.
     */
    get sessionId(): string | null;
}
import Interpolator from "../Interpolator.js";
