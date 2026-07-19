export default Storage;
/**
 * @class Storage
 * @description Manages the storage of the game
 */
declare class Storage {
    /**
     * @method writeToLocalStorage
     * @description Writes to local storage
     * @param {string} key - The key to write to
     * @param {any} value - The value to write to
     */
    static writeToLocalStorage(key: string, value: any): void;
    /**
     * @method readFromLocalStorage
     * @description Reads from local storage
     * @param {string} key - The key to read from
     * @returns {any} - The value read from local storage
     */
    static readFromLocalStorage(key: string): any;
    /**
     * @method clearLocalStorage
     * @description Clears local storage
     */
    static clearLocalStorage(): void;
    /**
     * @method writeToSessionStorage
     * @description Writes to session storage
     * @param {string} key - The key to write to
     * @param {any} value - The value to write to
     */
    static writeToSessionStorage(key: string, value: any): void;
    /**
     * @method readFromSessionStorage
     * @description Reads from session storage
     * @param {string} key - The key to read from
     * @returns {any} - The value read from session storage
     */
    static readFromSessionStorage(key: string): any;
    /**
     * @method clearSessionStorage
     * @description Clears session storage
     */
    static clearSessionStorage(): void;
    /**
     * @method save
     * @description Writes a versioned save under `key`. The payload is wrapped in
     * an envelope `{ v, t, data }` so it can be migrated later, and the previous
     * value is mirrored to `key + ".bak"` for corruption recovery. Quota and
     * serialization errors are caught and reported rather than thrown.
     * @param {string} key - The storage key
     * @param {any} data - The data to persist (must be JSON-serializable)
     * @param {Object} [options] - { version = 1, backup = true }
     * @returns {boolean} - Whether the write succeeded
     */
    static save(key: string, data: any, options?: any): boolean;
    /**
     * @method _unwrap
     * @description Parses a stored string into a `{ v, data }` envelope, treating
     * a plain (pre-versioning) value as version 0. Returns undefined for missing
     * data and throws for malformed JSON.
     * @private
     */
    private static _unwrap;
    /**
     * @method load
     * @description Reads a versioned save written by `save`. If the primary value
     * is corrupt it falls back to the `.bak` copy; if that fails too it returns
     * `fallback`. When the stored version differs from `version` and a `migrate`
     * function is given, the data is upgraded (and rewritten unless disabled).
     * @param {string} key - The storage key
     * @param {Object} [options] - { version = 1, fallback = null, migrate, rewrite = true }
     * @returns {any} - The (possibly migrated) saved data, or `fallback`
     */
    static load(key: string, options?: any): any;
    /**
     * @method hasSave
     * @description Returns whether a save (or its backup) exists for `key`.
     * @param {string} key - The storage key
     * @returns {boolean}
     */
    static hasSave(key: string): boolean;
    /**
     * @method removeSave
     * @description Deletes a save and its backup.
     * @param {string} key - The storage key
     */
    static removeSave(key: string): void;
}
