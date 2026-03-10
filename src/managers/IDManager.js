/**
 * @class IDManager
 * @description Manages the IDs for the game
 */
class IDManager {
  /**
   * @method generateID
   * @description Generates a random ID
   * @returns {string} - The random ID
   */
  static generateID() {
    return Math.random().toString(36).substring(2, 10);
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
}

IDManager.existingIDs = new Set();

export default IDManager;
