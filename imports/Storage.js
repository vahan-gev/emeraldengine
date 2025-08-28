/**
 * @class Storage
 * @description Manages the storage of the game
 */
class Storage {
    /**
     * @method writeToLocalStorage
     * @description Writes to local storage
     * @param {string} key - The key to write to
     * @param {any} value - The value to write to
     */
    static writeToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * @method readFromLocalStorage
     * @description Reads from local storage
     * @param {string} key - The key to read from
     * @returns {any} - The value read from local storage
     */
    static readFromLocalStorage(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    /**
     * @method clearLocalStorage
     * @description Clears local storage
     */
    static clearLocalStorage() {
        localStorage.clear();
    }

    /**
     * @method writeToSessionStorage
     * @description Writes to session storage
     * @param {string} key - The key to write to
     * @param {any} value - The value to write to
     */
    static writeToSessionStorage(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * @method readFromSessionStorage
     * @description Reads from session storage
     * @param {string} key - The key to read from
     * @returns {any} - The value read from session storage
     */
    static readFromSessionStorage(key) {
        return JSON.parse(sessionStorage.getItem(key));
    }

    /**
     * @method clearSessionStorage
     * @description Clears session storage
     */
    static clearSessionStorage() {
        sessionStorage.clear();
    }
}

export default Storage;