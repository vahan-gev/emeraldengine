export default AudioManager;
/**
 * @class AudioManager
 * @description Manages audio for the game with per-sound volume, looping,
 * overlapping one-shot playback for sound effects, named mix buses
 * (master / music / sfx and any custom bus) and volume fades / crossfades.
 *
 * Final playback volume for a sound is
 * `masterVolume * busVolume(sound.bus) * sound.volume`, so an options menu can
 * expose independent Music / SFX sliders that route through the buses.
 *
 * Fades are advanced by `update(dt)`. When `autoTick` is true (the default) and
 * `requestAnimationFrame` exists, the manager drives its own fades and you do
 * NOT need to call `update`. Pass `{ autoTick: false }` to advance fades
 * manually (e.g. from your game loop or in tests).
 *
 * @param {Object} [options]
 * @param {boolean} [options.autoTick=true] - Self-drive fades via requestAnimationFrame
 */
declare class AudioManager {
    constructor(options?: {});
    sounds: Map<any, any>;
    masterVolume: number;
    buses: Map<string, number>;
    defaultBus: string;
    listener: {
        x: number;
        y: number;
    };
    refDistance: number;
    maxDistance: number;
    /** @private */
    private _audioCtx;
    /** @private */
    private _fades;
    autoTick: boolean;
    /** @private */
    private _tickId;
    /** @private */
    private _lastTick;
    /**
     * @method getBusVolume
     * @description Returns the 0..1 volume of a named bus (1 if it doesn't exist).
     * @param {string} bus - The bus name (e.g. "music", "sfx")
     * @returns {number}
     */
    getBusVolume(bus: string): number;
    /**
     * @method setBusVolume
     * @description Sets the volume (0..1) of a named bus, creating it if needed,
     * and applies it immediately to any currently-playing tracked sounds on it.
     * @param {string} bus - The bus name
     * @param {number} volume - The volume (clamped to 0..1)
     */
    setBusVolume(bus: string, volume: number): void;
    /**
     * @method setSoundBus
     * @description Routes a registered sound through a named bus.
     * @param {string} name - The registered sound name
     * @param {string} bus - The bus name
     */
    setSoundBus(name: string, bus: string): void;
    /**
     * @method _busVolumeFor
     * @description Combined master * bus multiplier for a sound (before fade/per-sound volume).
     * @private
     */
    private _busVolumeFor;
    /**
     * @method _effectiveVolume
     * @description Final 0..1 volume for a tracked sound element.
     * @private
     */
    private _effectiveVolume;
    /**
     * @method _applyLiveVolumes
     * @description Re-applies the effective volume to the primary element of
     * tracked sounds (optionally filtered to one bus). Overlapping one-shots are
     * fire-and-forget and not retargeted.
     * @private
     */
    private _applyLiveVolumes;
    /**
     * @method setListener
     * @description Sets the world-space listener position (usually the camera or
     * player) used by playSpatial.
     * @param {number} x
     * @param {number} y
     */
    setListener(x: number, y: number): void;
    /**
     * @method setSpatialRange
     * @description Configures the distance attenuation model for playSpatial.
     * @param {number} refDistance - Distance within which volume is full
     * @param {number} maxDistance - Distance at/after which the sound is silent
     */
    setSpatialRange(refDistance: number, maxDistance: number): void;
    /**
     * @method computeSpatial
     * @description Pure helper: returns { volume, pan } for a source at `position`
     * relative to the current listener and distance model. `volume` is 0..1 (before
     * master/per-sound multipliers), `pan` is -1 (left) .. 1 (right). Exposed for
     * testing and custom routing.
     * @param {{x:number,y:number}} position
     * @returns {{volume:number, pan:number, distance:number}}
     */
    computeSpatial(position: {
        x: number;
        y: number;
    }): {
        volume: number;
        pan: number;
        distance: number;
    };
    /**
     * @method playSpatial
     * @description Plays a one-shot, overlapping copy of a sound positioned in the
     * world: volume falls off with distance from the listener and the sound pans
     * left/right. Uses Web Audio for true stereo panning when available, falling
     * back to volume-only otherwise.
     * @param {string} name - The registered sound name
     * @param {{x:number,y:number}} position - World-space source position
     * @returns {boolean} - Whether playback started
     */
    playSpatial(name: string, position: {
        x: number;
        y: number;
    }): boolean;
    /** @private */
    private _getAudioContext;
    /**
     * @method add
     * @description Adds an audio file to the manager
     * @param {string} path - The path to the audio file
     * @param {string} name - The name of the audio file
     * @param {Object} [options] - { volume = 1, loop = false, bus = "sfx" }
     */
    add(path: string, name: string, options?: any): boolean;
    /**
     * @method remove
     * @description Removes an audio file from the manager
     * @param {string} name - The name of the audio file
     */
    remove(name: string): boolean;
    /**
     * @method setMasterVolume
     * @description Sets the master volume applied to all sounds (0..1)
     * @param {number} volume - The master volume
     */
    setMasterVolume(volume: number): void;
    /**
     * @method setVolume
     * @description Sets the per-sound volume (0..1)
     * @param {string} name - The name of the audio file
     * @param {number} volume - The volume
     */
    setVolume(name: string, volume: number): void;
    /**
     * @method setLoop
     * @description Sets whether a sound loops
     * @param {string} name - The name of the audio file
     * @param {boolean} loop - Whether to loop
     */
    setLoop(name: string, loop: boolean): void;
    /**
     * @method play
     * @description Plays an audio file from the start
     * @param {string} name - The name of the audio file
     */
    play(name: string): Promise<boolean>;
    /**
     * @method playOverlap
     * @description Plays a one-shot copy of the sound that can overlap with other
     * instances of the same sound (ideal for rapid sound effects). The cloned
     * node is not tracked or interruptible.
     * @param {string} name - The name of the audio file
     */
    playOverlap(name: string): boolean;
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
     * @method fadeTo
     * @description Smoothly fades a sound's volume multiplier to a target (0..1)
     * over `duration` seconds. Starting playback first (e.g. `play(name)`) and
     * fading from 0 gives a fade-in; fading to 0 then stopping gives a fade-out.
     * @param {string} name - The registered sound name
     * @param {number} target - Target multiplier (0..1)
     * @param {number} duration - Fade time in seconds (<=0 applies instantly)
     * @param {Function} [onDone] - Called when the fade completes
     * @returns {boolean} - Whether the sound exists
     */
    fadeTo(name: string, target: number, duration: number, onDone?: Function): boolean;
    /**
     * @method fadeIn
     * @description Convenience: sets the fade multiplier to 0, starts playback and
     * fades up to full over `duration` seconds.
     * @param {string} name - The registered sound name
     * @param {number} duration - Fade time in seconds
     */
    fadeIn(name: string, duration: number): boolean;
    /**
     * @method fadeOut
     * @description Fades a sound down to silence over `duration` seconds, then
     * stops it (and resets its fade multiplier to 1 for next time).
     * @param {string} name - The registered sound name
     * @param {number} duration - Fade time in seconds
     */
    fadeOut(name: string, duration: number): boolean;
    /**
     * @method crossfade
     * @description Fades `fromName` out while fading `toName` in over `duration`
     * seconds (ideal for switching music tracks). Starts `toName` playing.
     * @param {string} fromName - Track to fade out (may be null)
     * @param {string} toName - Track to fade in
     * @param {number} duration - Fade time in seconds
     */
    crossfade(fromName: string, toName: string, duration: number): void;
    /**
     * @method _removeFadesFor
     * @description Cancels any in-flight fades for a sound name.
     * @private
     */
    private _removeFadesFor;
    /**
     * @method update
     * @description Advances active volume fades by `dt` seconds. Call this from
     * your loop when the manager was created with `{ autoTick: false }`; otherwise
     * the manager advances fades itself.
     * @param {number} dt - Elapsed seconds since the last update
     */
    update(dt: number): void;
    /**
     * @method _maybeStartTicker
     * @description Lazily starts the self-driven RAF ticker (browser + autoTick).
     * @private
     */
    private _maybeStartTicker;
    /**
     * @method getSound
     * @description Returns an audio file from the manager
     * @param {string} name - The name of the audio file
     */
    getSound(name: string): any;
}
