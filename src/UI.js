import GameObject from "./components/GameObject.js";
import { Square2D } from "./Shapes.js";
import CanvasText from "./CanvasText.js";
import Camera from "./Camera.js";
import Color from "./Color.js";
import { Vector2, Vector3 } from "./Physics.js";

/**
 * @class UI
 * @description A small retained-mode UI toolkit rendered entirely with the
 * engine (no DOM/HTML overlay): panels, labels, buttons and text fields, drawn
 * as screen-space objects on a dedicated layer with their own pointer/keyboard
 * hit-testing. Positions are in pixels from the viewport center (y up), or a
 * `(viewW, viewH) => ({x, y})` function for responsive anchoring; call
 * `relayout()` on resize.
 *
 * Pair it with a UI camera (see {@link UI.createCamera}) so the UI draws over
 * the game and the game cameras ignore the UI layer.
 *
 * @example
 * const uiCam = UI.createCamera();           // onlyLayers = [UI layer]
 * gameCamera.ignoreLayer(UI.LAYER);
 * emerald.setCameras([gameCamera, uiCam]);
 *
 * const ui = new UI(scene, canvas);
 * ui.label(() => ({ x: 0, y: 200 }), "PAUSED", { font: "700 48px sans-serif" });
 * ui.button(() => ({ x: 0, y: 0 }), "Resume", 220, 56, { onClick: resume });
 * // in the loop: ui.relayout() on resize; remove input via ui.destroy().
 */
class UI {
  /**
   * @param {Scene} scene - Scene to add UI objects to
   * @param {HTMLCanvasElement} canvas - Canvas for pointer coordinates
   * @param {Object} [options] - { layer = UI.LAYER, accent = [110,180,255] }
   */
  constructor(scene, canvas, options = {}) {
    this.scene = scene;
    this.canvas = canvas;
    this.layer = options.layer ?? UI.LAYER;
    this.accent = options.accent || [110, 180, 255];

    this.elements = [];
    this.focused = null;
    /** @private */
    this._hover = null;

    /** @private */
    this._onMove = (e) => this._handleMove(e);
    /** @private */
    this._onDown = (e) => this._handleDown(e);
    /** @private */
    this._onKey = (e) => this._handleKey(e);
    canvas.addEventListener("mousemove", this._onMove);
    canvas.addEventListener("mousedown", this._onDown);
    window.addEventListener("keydown", this._onKey);
  }

  /** @private */
  _resolvePos(pos) {
    const vw = this.canvas.clientWidth || this.canvas.width;
    const vh = this.canvas.clientHeight || this.canvas.height;
    return typeof pos === "function" ? pos(vw, vh) : pos;
  }

  /**
   * @method relayout
   * @description Recomputes positions of all elements (call after a resize).
   */
  relayout() {
    for (const el of this.elements) {
      const p = this._resolvePos(el.pos);
      el.x = p.x;
      el.y = p.y;
      el.go.transform.position.x = p.x;
      el.go.transform.position.y = p.y;
      if (el.label) {
        el.label.transform.position.x = p.x;
        el.label.transform.position.y = p.y;
      }
    }
  }

  /**
   * @method panel
   * @description Adds a rectangular panel.
   * @returns {Object} - Element handle
   */
  panel(pos, width, height, options = {}) {
    const color = options.color || new Color(20, 24, 34, 235);
    const go = this._makeQuad(pos, width, height, color, options.z ?? 0);
    if (options.opacity != null) go.setOpacity(options.opacity);
    const el = { type: "panel", go, pos, w: width, h: height };
    return this._register(el, pos);
  }

  /**
   * @method dim
   * @description Adds a full-screen dimmer (modal backdrop).
   * @returns {Object} - Element handle
   */
  dim(opacity = 0.6) {
    const go = this._makeQuad(
      { x: 0, y: 0 },
      20000,
      20000,
      new Color(0, 0, 0, 255),
      -1
    );
    go.setOpacity(opacity);
    const el = { type: "dim", go, pos: { x: 0, y: 0 }, w: 20000, h: 20000 };
    return this._register(el, { x: 0, y: 0 });
  }

  /**
   * @method label
   * @description Adds a text label.
   * @returns {Object} - Element handle with setText(text)
   */
  label(pos, text, options = {}) {
    const go = CanvasText.create(text, {
      font: options.font || "500 18px system-ui, sans-serif",
      color: options.color || "#e8eefc",
      screenSpace: true,
    });
    go.setLayer(this.layer);
    go.alwaysVisible = true;
    go.transform.position.z = options.z ?? 1;
    this.scene.add(go);
    const text2d = go.getComponent(CanvasText);
    const el = {
      type: "label",
      go,
      pos,
      get w() {
        return text2d.width;
      },
      get h() {
        return text2d.height;
      },
      setText: (t) => text2d.setText(t),
    };
    return this._register(el, pos);
  }

  /**
   * @method button
   * @description Adds an interactive button (panel + centered label).
   * @param {Object} [options] - { onClick, accent, font, color }
   * @returns {Object} - Element handle with setText(text), setEnabled(bool)
   */
  button(pos, text, width, height, options = {}) {
    const accent = options.accent || this.accent;
    const base = new Color(28, 34, 48, 245);
    const go = this._makeQuad(pos, width, height, base, options.z ?? 0);

    const label = CanvasText.create(text, {
      font: options.font || "600 18px system-ui, sans-serif",
      color: "#f2f6ff",
      screenSpace: true,
    });
    label.setLayer(this.layer);
    label.alwaysVisible = true;
    label.transform.position.z = (options.z ?? 0) + 1;
    this.scene.add(label);

    const shape = go.getComponent(Square2D);
    const el = {
      type: "button",
      go,
      label,
      pos,
      w: width,
      h: height,
      enabled: true,
      onClick: options.onClick,
      _base: base,
      _hover: new Color(accent[0], accent[1], accent[2], 255),
      _shape: shape,
      setText: (t) => label.getComponent(CanvasText).setText(t),
      setEnabled: (v) => {
        el.enabled = v;
        go.setOpacity(v ? 1 : 0.45);
      },
    };
    return this._register(el, pos);
  }

  /**
   * @method textField
   * @description Adds an editable single-line text field.
   * @param {Object} [options] - { value, placeholder, onChange, maxLength, font }
   * @returns {Object} - Element handle with getValue()/setValue(text)
   */
  textField(pos, width, height, options = {}) {
    const go = this._makeQuad(
      pos,
      width,
      height,
      new Color(12, 16, 24, 250),
      options.z ?? 0
    );
    const label = CanvasText.create(
      options.value || options.placeholder || "",
      {
        font: options.font || "500 18px system-ui, sans-serif",
        color: options.value ? "#e8eefc" : "#7c8aa0",
        screenSpace: true,
      }
    );
    label.setLayer(this.layer);
    label.alwaysVisible = true;
    label.transform.position.z = (options.z ?? 0) + 1;
    this.scene.add(label);

    const el = {
      type: "textField",
      go,
      label,
      pos,
      w: width,
      h: height,
      value: options.value || "",
      placeholder: options.placeholder || "",
      maxLength: options.maxLength || 64,
      onChange: options.onChange,
      _render: () => {
        const ct = label.getComponent(CanvasText);
        const showing = el.value || el.placeholder;
        ct.setColor(el.value ? "#e8eefc" : "#7c8aa0");
        ct.setText(showing + (this.focused === el ? "|" : ""));
      },
      getValue: () => el.value,
      setValue: (t) => {
        el.value = t;
        el._render();
      },
    };
    return this._register(el, pos);
  }

  /** @private */
  _makeQuad(pos, width, height, color, z) {
    const go = new GameObject(
      "UIQuad",
      new Vector3(0, 0, z),
      0,
      new Vector2(width / 2, height / 2)
    );
    const shape = new Square2D();
    shape.setColor(color);
    shape.setUseLighting(false);
    go.addComponent(shape);
    go.setScreenSpace(true);
    go.setLayer(this.layer);
    go.alwaysVisible = true;
    this.scene.add(go);
    const p = this._resolvePos(pos);
    go.transform.position.x = p.x;
    go.transform.position.y = p.y;
    return go;
  }

  /** @private */
  _register(el, pos) {
    const p = this._resolvePos(pos);
    el.x = p.x;
    el.y = p.y;
    this.elements.push(el);
    return el;
  }

  /** @private */
  _toScreen(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const cssW = rect.width;
    const cssH = rect.height;
    return {
      x: clientX - rect.left - cssW / 2,
      y: -(clientY - rect.top - cssH / 2),
    };
  }

  /** @private */
  _hitTest(sx, sy) {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (el.type !== "button" && el.type !== "textField") continue;
      if (el.enabled === false) continue;
      const x = el.x;
      const y = el.y;
      if (Math.abs(sx - x) <= el.w / 2 && Math.abs(sy - y) <= el.h / 2) {
        return el;
      }
    }
    return null;
  }

  /**
   * @method isOver
   * @description Whether an interactive element is under the given page point —
   * useful to suppress game clicks behind the UI.
   */
  isOver(clientX, clientY) {
    const s = this._toScreen(clientX, clientY);
    return this._hitTest(s.x, s.y) != null;
  }

  /** @private */
  _handleMove(e) {
    const s = this._toScreen(e.clientX, e.clientY);
    const hit = this._hitTest(s.x, s.y);
    if (hit === this._hover) return;
    if (this._hover && this._hover.type === "button") {
      this._hover._shape.setColor(this._hover._base);
    }
    this._hover = hit;
    if (hit && hit.type === "button") {
      hit._shape.setColor(hit._hover);
      this.canvas.style.cursor = "pointer";
    } else {
      this.canvas.style.cursor = "default";
    }
  }

  /** @private */
  _handleDown(e) {
    const s = this._toScreen(e.clientX, e.clientY);
    const hit = this._hitTest(s.x, s.y);

    if (this.focused && this.focused !== hit) {
      const prev = this.focused;
      this.focused = null;
      if (prev._render) prev._render();
    }

    if (!hit) return;
    if (hit.type === "button") {
      if (typeof hit.onClick === "function") hit.onClick(e, hit);
    } else if (hit.type === "textField") {
      this.focused = hit;
      hit._render();
    }
  }

  /** @private */
  _handleKey(e) {
    if (!this.focused || this.focused.type !== "textField") return;
    const el = this.focused;
    if (e.key === "Backspace") {
      el.value = el.value.slice(0, -1);
      e.preventDefault();
    } else if (e.key === "Enter" || e.key === "Escape") {
      this.focused = null;
    } else if (e.key.length === 1 && el.value.length < el.maxLength) {
      el.value += e.key;
      e.preventDefault();
    } else {
      return;
    }
    el._render();
    if (typeof el.onChange === "function") el.onChange(el.value);
  }

  /**
   * @method destroy
   * @description Removes all UI objects and detaches input listeners.
   */
  destroy() {
    for (const el of this.elements) {
      this.scene.remove(el.go);
      if (el.label) this.scene.remove(el.label);
    }
    this.elements.length = 0;
    this.canvas.removeEventListener("mousemove", this._onMove);
    this.canvas.removeEventListener("mousedown", this._onDown);
    window.removeEventListener("keydown", this._onKey);
    this.canvas.style.cursor = "default";
  }

  /**
   * @method createCamera
   * @description Returns a full-screen camera that renders only the UI layer,
   * so UI draws over the game. Add it last in setCameras.
   * @param {number} [layer] - The UI layer (defaults to UI.LAYER)
   * @returns {Camera}
   */
  static createCamera(layer = UI.LAYER) {
    return new Camera({ onlyLayers: [layer] });
  }
}

UI.LAYER = 100000;

export default UI;
