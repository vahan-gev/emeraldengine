export default EmeraldDB;
/**
 * @class EmeraldDB
 * @description Async game-save storage on IndexedDB — the big-world companion
 * to `Storage` (localStorage). Same versioned-envelope semantics (`{v,t,data}`
 * with a `.bak` backup and forward migration), but with no ~5MB quota and no
 * JSON round-trip: values are structured-cloned, so large nested world state
 * (tile grids, inventories, NPC state) saves fast and loads intact, including
 * Maps, Sets, Dates, and typed arrays.
 *
 * All methods are async. The database opens lazily on first use; call
 * `configure()` first if you want a custom database/store name.
 *
 * @example
 * // Save / load a world with schema migration:
 * await EmeraldDB.save("world", world, { version: 3 });
 * const world = await EmeraldDB.load("world", {
 *   version: 3,
 *   fallback: makeNewWorld(),
 *   migrate: (old, from) => upgradeWorld(old, from),
 * });
 *
 * // Plain key/value (no envelope):
 * await EmeraldDB.set("settings", { volume: 0.8 });
 * const settings = await EmeraldDB.get("settings", {});
 */
declare class EmeraldDB {
    /**
     * @method isSupported
     * @description Whether IndexedDB exists in this environment.
     * @returns {boolean}
     */
    static isSupported(): boolean;
    /**
     * @method configure
     * @description Sets the database and object-store names. Call before the
     * first read/write (once the database is open the names are fixed until
     * `close()`).
     * @param {Object} [options] - { name = "emerald-db", store = "kv" }
     * @returns {EmeraldDB} - the class, for chaining
     */
    static configure(options?: any): EmeraldDB;
    /**
     * @method _open
     * @description Lazily opens (and creates) the database. Shared promise so
     * concurrent calls open once.
     * @private
     */
    private static _open;
    /**
     * @method _tx
     * @description Runs `fn(store)` inside a transaction and resolves with its
     * request's result when the transaction completes.
     * @private
     */
    private static _tx;
    /**
     * @method set
     * @description Stores a value under a key (structured clone — objects, Maps,
     * Sets, typed arrays all survive).
     * @param {string} key
     * @param {*} value
     * @returns {Promise<void>}
     */
    static set(key: string, value: any): Promise<void>;
    /**
     * @method get
     * @description Reads a value; resolves `fallback` when the key is missing.
     * @param {string} key
     * @param {*} [fallback=undefined]
     * @returns {Promise<*>}
     */
    static get(key: string, fallback?: any): Promise<any>;
    /**
     * @method remove
     * @description Deletes a key.
     * @returns {Promise<void>}
     */
    static remove(key: any): Promise<void>;
    /**
     * @method keys
     * @description Lists every key in the store.
     * @returns {Promise<string[]>}
     */
    static keys(): Promise<string[]>;
    /**
     * @method clear
     * @description Deletes everything in the store.
     * @returns {Promise<void>}
     */
    static clear(): Promise<void>;
    /**
     * @method save
     * @description Writes a versioned save: the payload is wrapped in a
     * `{ v, t, data }` envelope and the previous value (if any) is mirrored to
     * `key + ".bak"` in the same transaction, so a torn write can always recover.
     * @param {string} key
     * @param {*} data - Any structured-cloneable value
     * @param {Object} [options] - { version = 1, backup = true }
     * @returns {Promise<void>}
     */
    static save(key: string, data: any, options?: any): Promise<void>;
    /**
     * @method load
     * @description Reads a versioned save. Falls back to the `.bak` mirror when
     * the primary is missing/invalid, migrates old versions forward via
     * `migrate(data, fromVersion)`, and (by default) rewrites migrated data in
     * the new format.
     * @param {string} key
     * @param {Object} [options] - { version = 1, fallback = null, migrate, rewrite = true }
     * @returns {Promise<*>}
     */
    static load(key: string, options?: any): Promise<any>;
    /**
     * @method hasSave
     * @description Whether a versioned save (or its backup) exists.
     * @returns {Promise<boolean>}
     */
    static hasSave(key: any): Promise<boolean>;
    /**
     * @method removeSave
     * @description Deletes a versioned save AND its backup.
     * @returns {Promise<void>}
     */
    static removeSave(key: any): Promise<void>;
    /**
     * @method importFromStorage
     * @description Copies a save written by the localStorage `Storage` class
     * into EmeraldDB (envelope preserved). Use once when upgrading an existing
     * game to IndexedDB saves.
     * @param {string} key
     * @returns {Promise<boolean>} - true if something was imported
     */
    static importFromStorage(key: string): Promise<boolean>;
    /**
     * @method close
     * @description Closes the database handle (reopens lazily on next use).
     */
    static close(): Promise<void>;
    /**
     * @method _asEnvelope
     * @description Returns the value if it looks like a save envelope, else null.
     * A plain (pre-versioning) object is wrapped as version 0 so it can migrate.
     * @private
     */
    private static _asEnvelope;
    /**
     * @method _resolveEnvelope
     * @description Pure envelope resolution shared by load(): applies fallback
     * and forward migration. Exposed for tests.
     * @private
     */
    private static _resolveEnvelope;
}
declare namespace EmeraldDB {
    let _name: string;
    let _store: string;
    let _db: any;
}
