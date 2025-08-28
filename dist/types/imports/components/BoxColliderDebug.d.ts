import Color from "../Color";
import { Physics } from "../Physics";
import GameObject from "./GameObject";
import RigidBody from "./RigidBody";
/**
 * @class BoxColliderDebug
 * @param {Rigidbody} rigidbody - The rigidbody to attach the collider to
 * @param {Color} color - The color of the collider
 */
declare class BoxColliderDebug {
    rigidbody: RigidBody;
    physics: Physics;
    scale: number;
    color: Color;
    gameObject: GameObject;
    constructor(rigidbody: RigidBody, color?: Color | null);
}
export default BoxColliderDebug;
//# sourceMappingURL=BoxColliderDebug.d.ts.map