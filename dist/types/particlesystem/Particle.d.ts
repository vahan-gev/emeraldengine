import Instance from "../Instance";
import InstancedTexture from "../InstancedTexture";
import { Vector2, Vector3 } from "../Physics";
import ParticleSettings from "./ParticleSettings";
/**
 * @class Particle
 * @description Represents a particle in the particle system
 * @param {InstancedTexture} instancedTexture - The instanced texture
 * @param {Vector3} position - The position of the particle
 * @param {number} rotation - The rotation of the particle
 * @param {Vector2} scale - The scale of the particle
 * @param {ParticleSettings} settings - The settings for the particle
 */
declare class Particle {
    settings: ParticleSettings;
    lifetime: number;
    age: number;
    velocity: Vector2;
    gravity: Vector2;
    instance: Instance;
    instancedTexture: InstancedTexture;
    constructor(instancedTexture: InstancedTexture, position: Vector3, rotation: number, scale: Vector2, settings: ParticleSettings);
    /**
     * @method update
     * @description Updates the particle
     * @param {number} dt - The delta time
     */
    update(dt: number): void;
    /**
     * @method isAlive
     * @description Checks if the particle is alive
     * @returns {boolean} - True if the particle is alive
     */
    isAlive(): boolean;
    /**
     * @method destroy
     * @description Destroys the particle
     */
    destroy(): void;
}
export default Particle;
//# sourceMappingURL=Particle.d.ts.map