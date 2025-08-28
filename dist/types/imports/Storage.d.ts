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
}
export default Storage;
//# sourceMappingURL=Storage.d.ts.map