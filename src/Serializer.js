/**
 * @class Serializer
 * @description Saves/loads a scene to/from plain JSON. Because components hold
 * live GL/physics handles that can't be serialized generically, reconstruction
 * goes through registered factories keyed by a `prefabType`. Each object's
 * transform, layer, opacity and an optional `serialize()` payload are captured.
 *
 * @example
 * Serializer.register("coin", (data) => makeCoin(data.value));
 * coin.prefabType = "coin";
 * coin.serialize = () => ({ value: 5 });
 *
 * const json = Serializer.toJSON(scene);          // save
 * Serializer.fromJSON(json, new Scene());          // load
 */
class Serializer {
  /**
   * @method register
   * @description Registers a factory that rebuilds an object from its data.
   * @param {string} type - The prefabType
   * @param {(data:any, entry:any) => Object} factory - Returns a GameObject
   */
  static register(type, factory) {
    Serializer.factories.set(type, factory);
  }

  /**
   * @method serializeObject
   * @description Captures a single object's serializable state.
   */
  static serializeObject(obj) {
    const t = obj.transform;
    return {
      type: obj.prefabType || null,
      name: obj.name,
      layer: obj.layer || 0,
      opacity: typeof obj.opacity === "number" ? obj.opacity : 1,
      screenSpace: !!obj.screenSpace,
      transform: t
        ? {
            position: { x: t.position.x, y: t.position.y, z: t.position.z },
            rotation: t.rotation,
            scale: { x: t.scale.x, y: t.scale.y },
          }
        : null,
      data:
        typeof obj.serialize === "function"
          ? obj.serialize()
          : obj.data || null,
    };
  }

  /**
   * @method serializeScene
   * @description Returns a plain object describing the scene.
   */
  static serializeScene(scene) {
    return { objects: scene.objects.map((o) => Serializer.serializeObject(o)) };
  }

  /**
   * @method applyState
   * @description Applies a serialized entry's transform/layer/opacity to an object.
   */
  static applyState(obj, entry) {
    if (entry.transform && obj.transform) {
      const t = entry.transform;
      obj.transform.position.x = t.position.x;
      obj.transform.position.y = t.position.y;
      obj.transform.position.z = t.position.z;
      obj.transform.rotation = t.rotation;
      obj.transform.scale.x = t.scale.x;
      obj.transform.scale.y = t.scale.y;
    }
    if (typeof entry.layer === "number") obj.layer = entry.layer;
    if (typeof entry.opacity === "number") obj.opacity = entry.opacity;
    if (entry.screenSpace && typeof obj.setScreenSpace === "function") {
      obj.setScreenSpace(true);
    }
    if (entry.name) obj.name = entry.name;
  }

  /**
   * @method deserializeObject
   * @description Rebuilds an object from an entry via its registered factory.
   * @returns {Object|null}
   */
  static deserializeObject(entry) {
    const factory = Serializer.factories.get(entry.type);
    if (!factory) {
      console.warn(`[Serializer] > No factory for type "${entry.type}"`);
      return null;
    }
    const obj = factory(entry.data, entry);
    if (obj) Serializer.applyState(obj, entry);
    return obj;
  }

  /**
   * @method deserializeScene
   * @description Rebuilds objects into the given scene.
   * @returns {Scene} - The populated scene
   */
  static deserializeScene(json, scene) {
    for (const entry of json.objects || []) {
      const obj = Serializer.deserializeObject(entry);
      if (obj) scene.add(obj);
    }
    return scene;
  }

  /**
   * @method toJSON
   * @description Serializes a scene to a JSON string.
   */
  static toJSON(scene) {
    return JSON.stringify(Serializer.serializeScene(scene));
  }

  /**
   * @method fromJSON
   * @description Loads a scene from a JSON string into the given scene.
   */
  static fromJSON(str, scene) {
    return Serializer.deserializeScene(JSON.parse(str), scene);
  }
}

Serializer.factories = new Map();

export default Serializer;
