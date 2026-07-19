export default Serializer;
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
declare class Serializer {
    /**
     * @method register
     * @description Registers a factory that rebuilds an object from its data.
     * @param {string} type - The prefabType
     * @param {(data:any, entry:any) => Object} factory - Returns a GameObject
     */
    static register(type: string, factory: (data: any, entry: any) => any): void;
    /**
     * @method serializeObject
     * @description Captures a single object's serializable state.
     */
    static serializeObject(obj: any): {
        type: any;
        name: any;
        layer: any;
        opacity: any;
        screenSpace: boolean;
        transform: {
            position: {
                x: any;
                y: any;
                z: any;
            };
            rotation: any;
            scale: {
                x: any;
                y: any;
            };
        };
        data: any;
    };
    /**
     * @method serializeScene
     * @description Returns a plain object describing the scene.
     */
    static serializeScene(scene: any): {
        objects: any;
    };
    /**
     * @method applyState
     * @description Applies a serialized entry's transform/layer/opacity to an object.
     */
    static applyState(obj: any, entry: any): void;
    /**
     * @method deserializeObject
     * @description Rebuilds an object from an entry via its registered factory.
     * @returns {Object|null}
     */
    static deserializeObject(entry: any): any | null;
    /**
     * @method deserializeScene
     * @description Rebuilds objects into the given scene.
     * @returns {Scene} - The populated scene
     */
    static deserializeScene(json: any, scene: any): Scene;
    /**
     * @method toJSON
     * @description Serializes a scene to a JSON string.
     */
    static toJSON(scene: any): string;
    /**
     * @method fromJSON
     * @description Loads a scene from a JSON string into the given scene.
     */
    static fromJSON(str: any, scene: any): Scene;
}
declare namespace Serializer {
    let factories: Map<any, any>;
}
