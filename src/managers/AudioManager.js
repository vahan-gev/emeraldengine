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
class AudioManager {
  constructor(options = {}) {
    this.sounds = new Map();
    this.masterVolume = 1.0;

    this.buses = new Map([
      ["music", 1.0],
      ["sfx", 1.0],
    ]);
    this.defaultBus = "sfx";

    this.listener = { x: 0, y: 0 };
    this.refDistance = 100;
    this.maxDistance = 800;
    /** @private */
    this._audioCtx = null;

    /** @private */
    this._fades = [];
    this.autoTick = options.autoTick !== false;
    /** @private */
    this._tickId = null;
    /** @private */
    this._lastTick = 0;
  }

  /**
   * @method getBusVolume
   * @description Returns the 0..1 volume of a named bus (1 if it doesn't exist).
   * @param {string} bus - The bus name (e.g. "music", "sfx")
   * @returns {number}
   */
  getBusVolume(bus) {
    const v = this.buses.get(bus);
    return v == null ? 1 : v;
  }

  /**
   * @method setBusVolume
   * @description Sets the volume (0..1) of a named bus, creating it if needed,
   * and applies it immediately to any currently-playing tracked sounds on it.
   * @param {string} bus - The bus name
   * @param {number} volume - The volume (clamped to 0..1)
   */
  setBusVolume(bus, volume) {
    this.buses.set(bus, Math.max(0, Math.min(1, volume)));
    this._applyLiveVolumes(bus);
  }

  /**
   * @method setSoundBus
   * @description Routes a registered sound through a named bus.
   * @param {string} name - The registered sound name
   * @param {string} bus - The bus name
   */
  setSoundBus(name, bus) {
    const sound = this.sounds.get(name);
    if (sound) sound.bus = bus;
  }

  /**
   * @method _busVolumeFor
   * @description Combined master * bus multiplier for a sound (before fade/per-sound volume).
   * @private
   */
  _busVolumeFor(sound) {
    return this.masterVolume * this.getBusVolume(sound.bus || this.defaultBus);
  }

  /**
   * @method _effectiveVolume
   * @description Final 0..1 volume for a tracked sound element.
   * @private
   */
  _effectiveVolume(sound) {
    return this._busVolumeFor(sound) * sound.volume * (sound._fadeMul ?? 1);
  }

  /**
   * @method _applyLiveVolumes
   * @description Re-applies the effective volume to the primary element of
   * tracked sounds (optionally filtered to one bus). Overlapping one-shots are
   * fire-and-forget and not retargeted.
   * @private
   */
  _applyLiveVolumes(bus) {
    for (const sound of this.sounds.values()) {
      if (bus != null && (sound.bus || this.defaultBus) !== bus) continue;
      sound.audio.volume = this._effectiveVolume(sound);
    }
  }

  /**
   * @method setListener
   * @description Sets the world-space listener position (usually the camera or
   * player) used by playSpatial.
   * @param {number} x
   * @param {number} y
   */
  setListener(x, y) {
    this.listener.x = x;
    this.listener.y = y;
  }

  /**
   * @method setSpatialRange
   * @description Configures the distance attenuation model for playSpatial.
   * @param {number} refDistance - Distance within which volume is full
   * @param {number} maxDistance - Distance at/after which the sound is silent
   */
  setSpatialRange(refDistance, maxDistance) {
    this.refDistance = Math.max(0, refDistance);
    this.maxDistance = Math.max(this.refDistance + 0.0001, maxDistance);
  }

  /**
   * @method computeSpatial
   * @description Pure helper: returns { volume, pan } for a source at `position`
   * relative to the current listener and distance model. `volume` is 0..1 (before
   * master/per-sound multipliers), `pan` is -1 (left) .. 1 (right). Exposed for
   * testing and custom routing.
   * @param {{x:number,y:number}} position
   * @returns {{volume:number, pan:number, distance:number}}
   */
  computeSpatial(position) {
    const dx = position.x - this.listener.x;
    const dy = position.y - this.listener.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let volume;
    if (distance <= this.refDistance) {
      volume = 1;
    } else if (distance >= this.maxDistance) {
      volume = 0;
    } else {
      volume =
        1 -
        (distance - this.refDistance) / (this.maxDistance - this.refDistance);
    }

    const pan = Math.max(-1, Math.min(1, dx / this.maxDistance));
    return { volume, pan, distance };
  }

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
  playSpatial(name, position) {
    const sound = this.sounds.get(name);
    if (!sound) return false;

    const { volume, pan } = this.computeSpatial(position);
    if (volume <= 0) return false;

    const node = sound.audio.cloneNode();
    node.loop = false;
    const finalVolume = this._busVolumeFor(sound) * sound.volume * volume;

    const ctx = this._getAudioContext();
    if (ctx && typeof ctx.createStereoPanner === "function") {
      try {
        const source = ctx.createMediaElementSource(node);
        const panner = ctx.createStereoPanner();
        const gain = ctx.createGain();
        panner.pan.value = pan;
        gain.gain.value = finalVolume;
        source.connect(panner);
        panner.connect(gain);
        gain.connect(ctx.destination);
        node
          .play()
          .catch((error) =>
            console.warn(`Spatial audio play interrupted for ${name}:`, error)
          );
        return true;
      } catch (err) {}
    }

    node.volume = finalVolume;
    const result = node.play();
    if (result && typeof result.catch === "function") {
      result.catch((error) =>
        console.warn(`Spatial audio play interrupted for ${name}:`, error)
      );
    }
    return true;
  }

  /** @private */
  _getAudioContext() {
    if (this._audioCtx) return this._audioCtx;
    const Ctx =
      typeof window !== "undefined" &&
      (window.AudioContext || window.webkitAudioContext);
    if (!Ctx) return null;
    try {
      this._audioCtx = new Ctx();
    } catch (err) {
      this._audioCtx = null;
    }
    return this._audioCtx;
  }

  /**
   * @method add
   * @description Adds an audio file to the manager
   * @param {string} path - The path to the audio file
   * @param {string} name - The name of the audio file
   * @param {Object} [options] - { volume = 1, loop = false, bus = "sfx" }
   */
  add(path, name, options = {}) {
    if (!this.sounds.has(name)) {
      const { volume = 1, loop = false, bus = this.defaultBus } = options;
      const audio = new Audio(path);
      audio.loop = loop;
      this.sounds.set(name, {
        audio,
        path,
        volume,
        loop,
        bus,
        _fadeMul: 1,
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
   * @method setMasterVolume
   * @description Sets the master volume applied to all sounds (0..1)
   * @param {number} volume - The master volume
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this._applyLiveVolumes();
  }

  /**
   * @method setVolume
   * @description Sets the per-sound volume (0..1)
   * @param {string} name - The name of the audio file
   * @param {number} volume - The volume
   */
  setVolume(name, volume) {
    const sound = this.sounds.get(name);
    if (sound) sound.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * @method setLoop
   * @description Sets whether a sound loops
   * @param {string} name - The name of the audio file
   * @param {boolean} loop - Whether to loop
   */
  setLoop(name, loop) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.loop = loop;
      sound.audio.loop = loop;
    }
  }

  /**
   * @method play
   * @description Plays an audio file from the start
   * @param {string} name - The name of the audio file
   */
  async play(name) {
    const sound = this.sounds.get(name);
    if (sound) {
      try {
        if (sound.playPromise) {
          await sound.playPromise;
        }

        sound.audio.pause();
        sound.audio.currentTime = 0;
        sound.audio.volume = this._effectiveVolume(sound);
        sound.audio.loop = sound.loop;

        sound.playPromise = sound.audio.play();
        await sound.playPromise;

        sound.playPromise = null;
        return true;
      } catch (error) {
        console.warn(`Audio play interrupted for ${name}:`, error);
        sound.playPromise = null;
        return false;
      }
    }
    return false;
  }

  /**
   * @method playOverlap
   * @description Plays a one-shot copy of the sound that can overlap with other
   * instances of the same sound (ideal for rapid sound effects). The cloned
   * node is not tracked or interruptible.
   * @param {string} name - The name of the audio file
   */
  playOverlap(name) {
    const sound = this.sounds.get(name);
    if (!sound) return false;
    const node = sound.audio.cloneNode();
    node.volume = this._effectiveVolume(sound);
    node.loop = false;
    const result = node.play();
    if (result && typeof result.catch === "function") {
      result.catch((error) =>
        console.warn(`Audio overlap play interrupted for ${name}:`, error)
      );
    }
    return true;
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
        if (sound.playPromise) {
          await sound.playPromise;
        }

        sound.audio.pause();
        sound.audio.currentTime = 0;
        sound.playPromise = null;
        return true;
      } catch (error) {
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
  fadeTo(name, target, duration, onDone) {
    const sound = this.sounds.get(name);
    if (!sound) return false;
    const to = Math.max(0, Math.min(1, target));
    this._removeFadesFor(name);
    if (!(duration > 0)) {
      sound._fadeMul = to;
      sound.audio.volume = this._effectiveVolume(sound);
      if (onDone) onDone();
      return true;
    }
    this._fades.push({
      name,
      sound,
      from: sound._fadeMul ?? 1,
      to,
      t: 0,
      duration,
      onDone: onDone || null,
    });
    this._maybeStartTicker();
    return true;
  }

  /**
   * @method fadeIn
   * @description Convenience: sets the fade multiplier to 0, starts playback and
   * fades up to full over `duration` seconds.
   * @param {string} name - The registered sound name
   * @param {number} duration - Fade time in seconds
   */
  fadeIn(name, duration) {
    const sound = this.sounds.get(name);
    if (!sound) return false;
    sound._fadeMul = 0;
    sound.audio.volume = 0;
    this.play(name);
    return this.fadeTo(name, 1, duration);
  }

  /**
   * @method fadeOut
   * @description Fades a sound down to silence over `duration` seconds, then
   * stops it (and resets its fade multiplier to 1 for next time).
   * @param {string} name - The registered sound name
   * @param {number} duration - Fade time in seconds
   */
  fadeOut(name, duration) {
    return this.fadeTo(name, 0, duration, () => {
      this.stop(name);
      const sound = this.sounds.get(name);
      if (sound) sound._fadeMul = 1;
    });
  }

  /**
   * @method crossfade
   * @description Fades `fromName` out while fading `toName` in over `duration`
   * seconds (ideal for switching music tracks). Starts `toName` playing.
   * @param {string} fromName - Track to fade out (may be null)
   * @param {string} toName - Track to fade in
   * @param {number} duration - Fade time in seconds
   */
  crossfade(fromName, toName, duration) {
    if (fromName) this.fadeOut(fromName, duration);
    if (toName) this.fadeIn(toName, duration);
  }

  /**
   * @method _removeFadesFor
   * @description Cancels any in-flight fades for a sound name.
   * @private
   */
  _removeFadesFor(name) {
    for (let i = this._fades.length - 1; i >= 0; i--) {
      if (this._fades[i].name === name) this._fades.splice(i, 1);
    }
  }

  /**
   * @method update
   * @description Advances active volume fades by `dt` seconds. Call this from
   * your loop when the manager was created with `{ autoTick: false }`; otherwise
   * the manager advances fades itself.
   * @param {number} dt - Elapsed seconds since the last update
   */
  update(dt) {
    if (!this._fades.length) return;
    for (let i = this._fades.length - 1; i >= 0; i--) {
      const f = this._fades[i];
      f.t += dt;
      const k = f.duration > 0 ? Math.min(1, f.t / f.duration) : 1;
      f.sound._fadeMul = f.from + (f.to - f.from) * k;
      f.sound.audio.volume = this._effectiveVolume(f.sound);
      if (k >= 1) {
        this._fades.splice(i, 1);
        if (f.onDone) f.onDone();
      }
    }
  }

  /**
   * @method _maybeStartTicker
   * @description Lazily starts the self-driven RAF ticker (browser + autoTick).
   * @private
   */
  _maybeStartTicker() {
    if (!this.autoTick || this._tickId != null) return;
    const raf =
      typeof globalThis !== "undefined" && globalThis.requestAnimationFrame
        ? globalThis.requestAnimationFrame.bind(globalThis)
        : null;
    if (!raf) return;
    this._lastTick = 0;
    const tick = (now) => {
      if (!this._lastTick) this._lastTick = now;
      const dt = (now - this._lastTick) / 1000;
      this._lastTick = now;
      this.update(dt);
      if (this._fades.length) {
        this._tickId = raf(tick);
      } else {
        this._tickId = null;
      }
    };
    this._tickId = raf(tick);
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
