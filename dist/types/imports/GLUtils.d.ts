declare function initShaderProgram(gl: WebGL2RenderingContext, vShader: string, fShader: string): WebGLProgram | null;
declare function loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null;
declare const initVertexBuffer: (gl: WebGL2RenderingContext, vertices: number[]) => WebGLBuffer | null;
declare function initInstancedBuffer(gl: WebGL2RenderingContext, data: Float32Array, itemSize: number): WebGLBuffer | null;
export { initShaderProgram, loadShader, initVertexBuffer, initInstancedBuffer };
//# sourceMappingURL=GLUtils.d.ts.map