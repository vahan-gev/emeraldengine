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
  static save(key, data, options = {}) {
    const version = options.version ?? 1;
    let serialized;
    try {
      serialized = JSON.stringify({ v: version, t: Date.now(), data });
    } catch (e) {
      console.warn(`[Storage] Could not serialize save "${key}":`, e);
      return false;
    }
    try {
      if (options.backup !== false) {
        const prev = localStorage.getItem(key);
        if (prev != null) {
          try {
            localStorage.setItem(key + ".bak", prev);
          } catch (_) {}
        }
      }
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.warn(`[Storage] Failed to save "${key}" (quota exceeded?):`, e);
      return false;
    }
  }

  /**
   * @method _unwrap
   * @description Parses a stored string into a `{ v, data }` envelope, treating
   * a plain (pre-versioning) value as version 0. Returns undefined for missing
   * data and throws for malformed JSON.
   * @private
   */
  static _unwrap(raw) {
    if (raw == null) return undefined;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "v" in parsed &&
      "data" in parsed
    ) {
      return parsed;
    }
    return { v: 0, data: parsed };
  }

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
  static load(key, options = {}) {
    const version = options.version ?? 1;
    const fallback = options.fallback ?? null;
    const migrate = options.migrate || null;

    let env;
    try {
      env = Storage._unwrap(localStorage.getItem(key));
    } catch (e) {
      try {
        env = Storage._unwrap(localStorage.getItem(key + ".bak"));
        if (env !== undefined) {
          console.warn(
            `[Storage] "${key}" was corrupt; recovered from backup.`
          );
        }
      } catch (_) {
        env = undefined;
      }
    }
    if (env === undefined) return fallback;

    let data = env.data;
    if (env.v !== version && migrate) {
      try {
        data = migrate(data, env.v, version);
      } catch (e) {
        console.warn(`[Storage] Migration failed for "${key}":`, e);
        return fallback;
      }
      if (options.rewrite !== false) {
        Storage.save(key, data, { version, backup: false });
      }
    }
    return data;
  }

  /**
   * @method hasSave
   * @description Returns whether a save (or its backup) exists for `key`.
   * @param {string} key - The storage key
   * @returns {boolean}
   */
  static hasSave(key) {
    return (
      localStorage.getItem(key) != null ||
      localStorage.getItem(key + ".bak") != null
    );
  }

  /**
   * @method removeSave
   * @description Deletes a save and its backup.
   * @param {string} key - The storage key
   */
  static removeSave(key) {
    localStorage.removeItem(key);
    localStorage.removeItem(key + ".bak");
  }
}

export default Storage;
