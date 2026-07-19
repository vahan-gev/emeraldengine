export default Easing;
declare namespace Easing {
    function linear(t: any): any;
    function inQuad(t: any): number;
    function outQuad(t: any): number;
    function inOutQuad(t: any): number;
    function inCubic(t: any): number;
    function outCubic(t: any): number;
    function inOutCubic(t: any): number;
    function inQuart(t: any): number;
    function outQuart(t: any): number;
    function inOutQuart(t: any): number;
    function inSine(t: any): number;
    function outSine(t: any): number;
    function inOutSine(t: any): number;
    function inExpo(t: any): number;
    function outExpo(t: any): number;
    function inBack(t: any): number;
    function outBack(t: any): number;
    function outElastic(t: any): number;
    function outBounce(t: any): number;
}
