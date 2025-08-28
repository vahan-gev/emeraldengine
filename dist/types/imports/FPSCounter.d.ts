/**
 * @class FPSCounter
 * @description Represents a FPS counter
 */
declare class FPSCounter {
    lastFrameTime: number;
    frameCount: number;
    fps: number;
    fpsElement: HTMLDivElement;
    accumulatedTime: number;
    constructor();
    /**
     * @method update
     * @description Updates the FPS counter
     */
    update(): void;
}
export default FPSCounter;
//# sourceMappingURL=FPSCounter.d.ts.map