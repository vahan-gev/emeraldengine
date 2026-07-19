/**
 * @class IDManager
 * @description Manages the IDs for the game
 */
class IDManager {
  /**
   * @method generateID
   * @description Generates a random ID, preferring the collision-resistant
   * crypto.randomUUID when available and falling back to a random string.
   * @returns {string} - The random ID
   */
  static generateID() {
    if (
      typeof globalThis !== "undefined" &&
      globalThis.crypto &&
      typeof globalThis.crypto.randomUUID === "function"
    ) {
      return globalThis.crypto.randomUUID();
    }
    return (
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10)
    );
  }

  /**
   * @method generateUniqueID
   * @description Generates a unique ID
   * @returns {string} - The unique ID
   */
  static generateUniqueID() {
    var id;
    do {
      id = IDManager.generateID();
    } while (IDManager.existingIDs.has(id));
    IDManager.existingIDs.add(id);
    return id;
  }

  /**
   * @method release
   * @description Releases a previously-generated ID so the global registry
   * doesn't grow without bound. Call this when an object/instance is destroyed
   * (e.g. particles removed from an InstancedTexture).
   * @param {string} id - The ID to release
   */
  static release(id) {
    if (id != null) IDManager.existingIDs.delete(id);
  }
}

IDManager.existingIDs = new Set();

export default IDManager;
