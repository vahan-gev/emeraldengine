export default IDManager;
/**
 * @class IDManager
 * @description Manages the IDs for the game
 */
declare class IDManager {
    /**
     * @method generateID
     * @description Generates a random ID, preferring the collision-resistant
     * crypto.randomUUID when available and falling back to a random string.
     * @returns {string} - The random ID
     */
    static generateID(): string;
    /**
     * @method generateUniqueID
     * @description Generates a unique ID
     * @returns {string} - The unique ID
     */
    static generateUniqueID(): string;
    /**
     * @method release
     * @description Releases a previously-generated ID so the global registry
     * doesn't grow without bound. Call this when an object/instance is destroyed
     * (e.g. particles removed from an InstancedTexture).
     * @param {string} id - The ID to release
     */
    static release(id: string): void;
}
declare namespace IDManager {
    let existingIDs: Set<any>;
}
