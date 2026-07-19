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
class RenderStats {
  /**
   * @method beginFrame
   * @description Snapshots the counters gathered since the previous call into
   * `frame` and zeroes the accumulators. Called by Emerald.drawScene.
   */
  static beginFrame() {
    RenderStats.frame.drawCalls = RenderStats.drawCalls;
    RenderStats.frame.quads = RenderStats.quads;
    RenderStats.frame.textureBinds = RenderStats.textureBinds;
    RenderStats.drawCalls = 0;
    RenderStats.quads = 0;
    RenderStats.textureBinds = 0;
  }
}

RenderStats.drawCalls = 0;
RenderStats.quads = 0;
RenderStats.textureBinds = 0;
RenderStats.frame = { drawCalls: 0, quads: 0, textureBinds: 0 };

export default RenderStats;
