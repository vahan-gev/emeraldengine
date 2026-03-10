import Color from "../Color";
import { Physics } from "../Physics";
import GameObject from "./GameObject";
import RigidBody from "./RigidBody";
/**
 * @class CircleColliderDebug
 * @param {Rigidbody} rigidbody - The rigidbody to attach the collider to
 * @param {Color} color - The color of the collider
 */
declare class CircleColliderDebug {
    rigidbody: RigidBody;
    physics: Physics;
    scale: number;
    color: Color;
    gameObject: GameObject;
    constructor(rigidbody: RigidBody, color?: Color | null);
}
export default CircleColliderDebug;
//# sourceMappingURL=CircleColliderDebug.d.ts.map