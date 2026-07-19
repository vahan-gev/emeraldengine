import RigidBody from "./components/RigidBody.js";

/**
 * @class DebugOverlay
 * @description A DOM panel that profiles the running game: FPS, frame-time stats
 * with a live sparkline graph, object/camera counts, the primary camera's
 * position/zoom, JS heap usage (where available), and any extra metrics you
 * push. It can also toggle physics collider debug shapes on a scene.
 *
 * Call `update(emerald, scene)` each frame; toggle visibility with `setVisible`.
 *
 * @example
 * const debug = new DebugOverlay();
 * // each frame, after drawScene:
 * debug.update(emerald, scene);
 * debug.setMetric("draws", spriteBatch.drawCalls);
 * debug.showColliders(scene, true); // visualize physics colliders
 */
class DebugOverlay {
  constructor(options = {}) {
    this.element = document.createElement("div");
    Object.assign(this.element.style, {
      position: "absolute",
      top: options.top || "10px",
      right: options.right || "10px",
      padding: "8px 10px",
      background: "rgba(0,0,0,0.6)",
      color: "#9be7c4",
      font: "12px/1.5 monospace",
      whiteSpace: "pre",
      borderRadius: "6px",
      pointerEvents: "none",
      zIndex: "9999",
    });

    /** @private */
    this._graph = document.createElement("canvas");
    this._graph.width = options.graphWidth || 160;
    this._graph.height = options.graphHeight || 36;
    this._graph.style.display = "block";
    this._graph.style.marginTop = "6px";
    this._graph.style.borderRadius = "3px";
    /** @private */
    this._gctx = this._graph.getContext("2d");

    /** @private */
    this._text = document.createElement("div");
    this.element.appendChild(this._text);
    this.element.appendChild(this._graph);

    (options.parent || document.body).appendChild(this.element);

    /** @private */
    this._last = performance.now();
    /** @private */
    this._frames = 0;
    /** @private */
    this._accum = 0;
    this.fps = 0;

    /** @private */
    this._frameTimes = [];
    /** @private */
    this._maxSamples = this._graph.width;
    /** @private */
    this._dtMs = 0;
    /** @private */
    this._minMs = 0;
    /** @private */
    this._maxMs = 0;
    /** @private */
    this._avgMs = 0;

    /** @private */
    this._metrics = {};
    /** @private */
    this._colliderScene = null;
    /** @private */
    this._collidersShown = false;
  }

  /**
   * @method setMetric
   * @description Adds/updates a custom metric line shown in the panel.
   * @param {string} key
   * @param {*} value
   */
  setMetric(key, value) {
    this._metrics[key] = value;
  }

  /**
   * @method update
   * @description Updates the overlay. Pass the engine and current scene.
   * @param {Emerald} emerald
   * @param {Scene} scene
   */
  update(emerald, scene) {
    const now = performance.now();
    const dt = now - this._last;
    this._last = now;
    this._dtMs = dt;
    this._accum += dt;
    this._frames++;

    this._frameTimes.push(dt);
    if (this._frameTimes.length > this._maxSamples) this._frameTimes.shift();

    if (this._accum >= 500) {
      this.fps = Math.round((this._frames * 1000) / this._accum);
      this._frames = 0;
      this._accum = 0;

      let min = Infinity;
      let max = 0;
      let sum = 0;
      for (const t of this._frameTimes) {
        if (t < min) min = t;
        if (t > max) max = t;
        sum += t;
      }
      this._minMs = min === Infinity ? 0 : min;
      this._maxMs = max;
      this._avgMs = this._frameTimes.length ? sum / this._frameTimes.length : 0;
    }

    const objectCount = scene && scene.objects ? scene.objects.length : 0;
    const cameras = emerald && emerald.cameras ? emerald.cameras.length : 0;
    let camLine = "";
    if (emerald && emerald.camera && emerald.camera.getPosition) {
      const p = emerald.camera.getPosition();
      const z = emerald.camera.getZoom ? emerald.camera.getZoom() : 1;
      camLine = `\ncam   ${p.x.toFixed(0)}, ${p.y.toFixed(0)}  zoom ${z.toFixed(2)}`;
    }

    let renderLines = "";
    if (emerald && typeof emerald.getRenderStats === "function") {
      const rs = emerald.getRenderStats();
      renderLines =
        `\ndraws ${rs.drawCalls}  quads ${rs.quads}` +
        `\nbinds ${rs.textureBinds}`;
    }

    let memLine = "";
    if (performance && performance.memory) {
      const mb = performance.memory.usedJSHeapSize / (1024 * 1024);
      memLine = `\nheap  ${mb.toFixed(1)} MB`;
    }

    let metricLines = "";
    for (const key in this._metrics) {
      metricLines += `\n${key.padEnd(5)} ${this._metrics[key]}`;
    }

    this._text.textContent =
      `FPS    ${this.fps}` +
      `\nframe  ${this._dtMs.toFixed(1)}ms` +
      `\nmin/avg/max ${this._minMs.toFixed(1)}/${this._avgMs.toFixed(1)}/${this._maxMs.toFixed(1)}` +
      `\nobjs   ${objectCount}` +
      `\ncams   ${cameras}` +
      renderLines +
      camLine +
      memLine +
      metricLines;

    this._drawGraph();
  }

  /** @private */
  _drawGraph() {
    const ctx = this._gctx;
    const w = this._graph.width;
    const h = this._graph.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(0, 0, w, h);

    const scale = h / 50;
    ctx.strokeStyle = "rgba(120,220,160,0.35)";
    ctx.beginPath();
    ctx.moveTo(0, h - 16.7 * scale);
    ctx.lineTo(w, h - 16.7 * scale);
    ctx.stroke();
    ctx.strokeStyle = "rgba(220,180,120,0.3)";
    ctx.beginPath();
    ctx.moveTo(0, h - 33.3 * scale);
    ctx.lineTo(w, h - 33.3 * scale);
    ctx.stroke();

    ctx.strokeStyle = "#7fdcff";
    ctx.beginPath();
    const n = this._frameTimes.length;
    for (let i = 0; i < n; i++) {
      const x = w - n + i;
      const y = h - Math.min(h, this._frameTimes[i] * scale);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /**
   * @method showColliders
   * @description Toggles physics collider debug shapes for every RigidBody in a
   * scene's objects (uses the lazy debug shapes on each collider).
   * @param {Scene} scene
   * @param {boolean} show
   */
  showColliders(scene, show) {
    this._collidersShown = show;
    this._colliderScene = scene;
    if (!scene || !scene.objects) return;
    for (const obj of scene.objects) {
      if (!obj.getComponent) continue;
      const rb = obj.getComponent(RigidBody);
      if (!rb) continue;
      const collider = rb.getCollider();
      if (!collider) continue;
      if (show && typeof collider.showDebugShape === "function") {
        collider.showDebugShape();
      } else if (!show && typeof collider.hideDebugShape === "function") {
        collider.hideDebugShape();
      }
    }
  }

  /**
   * @method setVisible
   * @param {boolean} visible
   */
  setVisible(visible) {
    this.element.style.display = visible ? "block" : "none";
  }

  /**
   * @method destroy
   * @description Removes the overlay from the DOM.
   */
  destroy() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

export default DebugOverlay;
