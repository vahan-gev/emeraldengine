/**
 * @class Particles
 * @description Represents a particle system
 * @param {string} name - The name of the particle system
 * @param {string} texturePath - The path to the texture
 * @param {number} frameWidth - The width of the frame
 * @param {number} frameHeight - The height of the frame
 * @param {number} framesPerRow - The number of frames per row
 * @param {number} totalFrames - The total number of frames
 * @param {number} duration - The duration of the particle system
 * @param {ParticleSettings} settings - The settings for the particle system
 */
export default class Particles {
    constructor(name: any, texturePath: any, frameWidth: any, frameHeight: any, framesPerRow: any, totalFrames: any, duration?: number, settings?: any);
    settings: ParticleSettings;
    position: Vector3;
    rotation: any;
    scale: any;
    particles: any[];
    duration: number;
    offset: any;
    elapsed: number;
    active: boolean;
    instanceCount: number;
    emissionTimer: number;
    emittedParticles: number;
    stopped: boolean;
    gameObject: GameObject;
    instancedTexture: InstancedTexture;
    /** @private */
    private _pool;
    /**
     * @method play
     * @description Plays the particle system
     * @param {Vector3} newPosition - The position to play the particle system at
     */
    play(newPosition: Vector3): void;
    lastEmitPosition: Vector3;
    /**
     * @method emitParticles
     * @description Emits particles
     * @param {number} count - The number of particles to emit
     * @param {Vector3} position - The position to emit the particles at
     */
    emitParticles(count: number, position: Vector3): void;
    /**
     * @method _spawnOffset
     * @description Returns a spawn offset { x, y } from the emitter center based on
     * the configured emitter shape.
     * @param {number} finalAngle - The chosen emission angle (for the cone shape)
     * @private
     */
    private _spawnOffset;
    /**
     * @method update
     * @description Updates the particle system
     * @param {number} deltaTime - The delta time
     */
    update(deltaTime: number): void;
    /**
     * @method stop
     * @description Stops the particle system
     */
    stop(): void;
    /**
     * @method destroy
     * @description Destroys the particle system
     */
    destroy(): void;
    /**
     * @method reset
     * @description Resets the particle system
     */
    reset(): void;
}
import ParticleSettings from "./ParticleSettings.js";
import { Vector3 } from "../Physics.js";
import GameObject from "../components/GameObject.js";
import InstancedTexture from "../InstancedTexture.js";
