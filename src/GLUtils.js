function initShaderProgram(gl, vShader, fShader) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vShader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fShader);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `[GLUtils.js] > Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }
  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `[GLUtils.js] An error occurred compiling the shaders: ${gl.getShaderInfoLog(
        shader
      )}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

const initVertexBuffer = (gl, vertices) => {
  const floatArray = new Float32Array(vertices);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, floatArray, gl.STATIC_DRAW);
  buffer._bufferSize = floatArray.byteLength;
  buffer._src = floatArray;
  return buffer;
};

function initInstancedBuffer(gl, data, itemSize) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  buffer.itemSize = itemSize;
  buffer.numItems = data.length / itemSize;
  return buffer;
}

export { initShaderProgram, loadShader, initVertexBuffer, initInstancedBuffer };
