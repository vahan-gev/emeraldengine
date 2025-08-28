/**
 * @class IDManager
 * @description Manages the IDs for the game
 */
declare class IDManager {
    static existingIDs: Set<string>;
    /**
     * @method generateID
     * @description Generates a random ID
     * @returns {string} - The random ID
     */
    static generateID(): string;
    /**
     * @method generateUniqueID
     * @description Generates a unique ID
     * @returns {string} - The unique ID
     */
    static generateUniqueID(): string;
}
export default IDManager;
//# sourceMappingURL=IDManager.d.ts.map