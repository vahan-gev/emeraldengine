/**
 * @class AudioManager
 * @description Manages the audio for the game
 */
class AudioManager {
  constructor() {
    this.sounds = new Map();
  }

  /**
   * @method add
   * @description Adds an audio file to the manager
   * @param {string} path - The path to the audio file
   * @param {string} name - The name of the audio file
   */
  add(path, name) {
    if (!this.sounds.has(name)) {
      const audio = new Audio(path);
      this.sounds.set(name, {
        audio,
        id: Math.random().toString(36).substring(7),
        playPromise: null,
      });
      return true;
    }
    return false;
  }

  /**
   * @method remove
   * @description Removes an audio file from the manager
   * @param {string} name - The name of the audio file
   */
  remove(name) {
    return this.sounds.delete(name);
  }

  /**
   * @method play
   * @description Plays an audio file
   * @param {string} name - The name of the audio file
   */
  async play(name) {
    const sound = this.sounds.get(name);
    if (sound) {
      try {
        // Wait for any existing play promise to resolve before starting a new one
        if (sound.playPromise) {
          await sound.playPromise;
        }

        sound.audio.pause();
        sound.audio.currentTime = 0;

        // Store the play promise to handle future conflicts
        sound.playPromise = sound.audio.play();
        await sound.playPromise;

        // Clear the promise once it's resolved
        sound.playPromise = null;
        return true;
      } catch (error) {
        // Handle the interrupt error gracefully
        console.warn(`Audio play interrupted for ${name}:`, error);
        sound.playPromise = null;
        return false;
      }
    }
    return false;
  }

  /**
   * @method stop
   * @description Stops an audio file
   * @param {string} name - The name of the audio file
   */
  async stop(name) {
    const sound = this.sounds.get(name);
    if (sound) {
      try {
        // Wait for any existing play promise to resolve before stopping
        if (sound.playPromise) {
          await sound.playPromise;
        }

        sound.audio.pause();
        sound.audio.currentTime = 0;
        sound.playPromise = null;
        return true;
      } catch (error) {
        // Handle any errors gracefully
        console.warn(`Audio stop interrupted for ${name}:`, error);
        sound.audio.pause();
        sound.audio.currentTime = 0;
        sound.playPromise = null;
        return false;
      }
    }
    return false;
  }

  /**
   * @method stopAll
   * @description Stops all audio files
   */
  async stopAll() {
    const stopPromises = Array.from(this.sounds.values()).map(async (sound) => {
      try {
        if (sound.playPromise) {
          await sound.playPromise;
        }
        sound.audio.pause();
        sound.audio.currentTime = 0;
        sound.playPromise = null;
      } catch (error) {
        console.warn("Audio stop interrupted:", error);
        sound.audio.pause();
        sound.audio.currentTime = 0;
        sound.playPromise = null;
      }
    });

    await Promise.all(stopPromises);
  }

  /**
   * @method playExclusive
   * @description Plays an audio file after stopping all other audio files
   * @param {string} name - The name of the audio file
   */
  async playExclusive(name) {
    await this.stopAll();
    return this.play(name);
  }

  /**
   * @method getSound
   * @description Returns an audio file from the manager
   * @param {string} name - The name of the audio file
   */
  getSound(name) {
    return this.sounds.get(name);
  }
}

export default AudioManager;
