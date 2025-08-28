import GameObject from "../components/GameObject";
import InstancedTexture from "../InstancedTexture";
import { Vector2, Vector3 } from "../Physics";
import Particle from "./Particle";
import ParticleSettings from "./ParticleSettings";
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
    settings: ParticleSettings;
    position: Vector3;
    rotation: number;
    scale: Vector2;
    particles: Particle[];
    duration: number;
    offset: number;
    elapsed: number;
    active: boolean;
    instanceCount: number;
    emissionTimer: number;
    emittedParticles: number;
    stopped: boolean;
    gameObject: GameObject;
    instancedTexture: InstancedTexture;
    lastEmitPosition: Vector3;
    constructor(name: string, texturePath: string, frameWidth: number, frameHeight: number, framesPerRow: number, totalFrames: number, duration?: number, settings?: ParticleSettings | null);
    /**
     * @method play
     * @description Plays the particle system
     * @param {Vector3} newPosition - The position to play the particle system at
     */
    play(newPosition: Vector3): void;
    /**
     * @method emitParticles
     * @description Emits particles
     * @param {number} count - The number of particles to emit
     * @param {Vector3} position - The position to emit the particles at
     */
    emitParticles(count: number, position: Vector3): void;
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
//# sourceMappingURL=Particles.d.ts.map