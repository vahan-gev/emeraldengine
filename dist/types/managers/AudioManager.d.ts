/**
 * @class AudioManager
 * @description Manages the audio for the game
 */
declare class AudioManager {
    sounds: Map<string, {
        audio: HTMLAudioElement;
        id: string;
        playPromise: Promise<void> | null;
    }>;
    constructor();
    /**
     * @method add
     * @description Adds an audio file to the manager
     * @param {string} path - The path to the audio file
     * @param {string} name - The name of the audio file
     */
    add(path: string, name: string): boolean;
    /**
     * @method remove
     * @description Removes an audio file from the manager
     * @param {string} name - The name of the audio file
     */
    remove(name: string): boolean;
    /**
     * @method play
     * @description Plays an audio file
     * @param {string} name - The name of the audio file
     */
    play(name: string): Promise<boolean>;
    /**
     * @method stop
     * @description Stops an audio file
     * @param {string} name - The name of the audio file
     */
    stop(name: string): Promise<boolean>;
    /**
     * @method stopAll
     * @description Stops all audio files
     */
    stopAll(): Promise<void>;
    /**
     * @method playExclusive
     * @description Plays an audio file after stopping all other audio files
     * @param {string} name - The name of the audio file
     */
    playExclusive(name: string): Promise<boolean>;
    /**
     * @method getSound
     * @description Returns an audio file from the manager
     * @param {string} name - The name of the audio file
     */
    getSound(name: string): {
        audio: HTMLAudioElement;
        id: string;
        playPromise: Promise<void> | null;
    } | undefined;
}
export default AudioManager;
//# sourceMappingURL=AudioManager.d.ts.map