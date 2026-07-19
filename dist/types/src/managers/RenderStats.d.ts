export default RenderStats;
/**
 * @class RenderStats
 * @description Frame-level render counters, incremented by every draw site in
 * the engine (Drawable, InstancedTexture, SpriteBatch, post-processing) and
 * reset at the start of each drawScene. Read the previous completed frame via
 * `RenderStats.frame` or `emerald.getRenderStats()` — DebugOverlay shows it
 * automatically.
 *
 * - drawCalls:    GPU draw commands issued (the batching win shows up here)
 * - quads:        sprites/shapes drawn, counting every instance in a batch
 * - textureBinds: texture switches (high numbers = poor batching order)
 */
declare class RenderStats {
    /**
     * @method beginFrame
     * @description Snapshots the counters gathered since the previous call into
     * `frame` and zeroes the accumulators. Called by Emerald.drawScene.
     */
    static beginFrame(): void;
}
declare namespace RenderStats {
    let drawCalls: number;
    let quads: number;
    let textureBinds: number;
    namespace frame {
        let drawCalls_1: number;
        export { drawCalls_1 as drawCalls };
        let quads_1: number;
        export { quads_1 as quads };
        let textureBinds_1: number;
        export { textureBinds_1 as textureBinds };
    }
}
