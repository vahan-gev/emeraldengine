export default CollisionLayers;
declare class CollisionLayers {
    /**
     * @method define
     * @description Registers one or more named layers (in order), assigning each
     * the next free category bit. Re-defining an existing name returns its
     * existing bit. Returns the bit of the last name passed.
     * @param {...string} names
     * @returns {number}
     */
    static define(...names: string[]): number;
    /**
     * @method bit
     * @description Returns the category bit for a layer name, registering it on
     * first use.
     * @param {string} name
     * @returns {number}
     */
    static bit(name: string): number;
    /**
     * @method mask
     * @description Computes a combined mask from layer names. Accepts a single
     * name, an array of names, a number (passed through), or "all"/null for
     * "collide with everything".
     * @param {string|string[]|number|null} layers
     * @returns {number}
     */
    static mask(layers: string | string[] | number | null): number;
    /**
     * @method reset
     * @description Clears all registered layers (mainly for tests).
     */
    static reset(): void;
}
declare namespace CollisionLayers {
    export let _bits: Map<any, any>;
    export let _next: number;
    export { ALL_BITS as ALL };
}
/**
 * @class CollisionLayers
 * @description A small registry that maps human-readable layer names to the
 * category bits planck uses for collision filtering, so games can say
 * "players collide with ground and enemies, but not with each other" without
 * juggling raw bitmasks.
 *
 * Two fixtures collide only if each one's category is in the other's mask, so
 * filtering is symmetric by construction. Up to 16 distinct layers are
 * supported (planck filter bits are 16-bit).
 *
 * @example
 * CollisionLayers.define("ground", "player", "enemy", "pickup");
 * playerCollider.setCategory("player");
 * playerCollider.setCollidesWith(["ground", "enemy", "pickup"]);
 * enemyCollider.setCategory("enemy");
 * enemyCollider.setCollidesWith(["ground", "player"]); // enemies ignore each other
 */
declare const ALL_BITS: 65535;
