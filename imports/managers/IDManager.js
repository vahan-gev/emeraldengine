/**
 * @class IDManager
 * @description Manages the IDs for the game
 */
class IDManager {
  static existingIDs = new Set();

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
    let id;
    do {
      id = this.generateID();
    } while (this.existingIDs.has(id));
    this.existingIDs.add(id);
    return id;
  }
}

export default IDManager;
