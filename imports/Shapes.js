import { initVertexBuffer } from "./GLUtils.js";
import Drawable from "./Drawable.js";
import GLManager from "./managers/GLManager.js";

/**
 * @class Square2D
 * @description Represents a square 2D shape
 */
class Square2D extends Drawable {
  constructor() {
    const vertices = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    const verticesBuffer = initVertexBuffer(GLManager.getGL(), vertices);
    const textureCoordinates = [
      1.0,
      1.0, // Top-right
      0.0,
      1.0, // Top-left
      1.0,
      0.0, // Bottom-right
      0.0,
      0.0, // Bottom-left
    ];
    const texCoordBuffer = initVertexBuffer(
      GLManager.getGL(),
      textureCoordinates
    );

    super(
      GLManager.getGL(),
      GLManager.getProgramInfo(),
      verticesBuffer,
      texCoordBuffer,
      vertices,
      false,
      "",
      0,
      0,
      0,
      0,
      0,
      false
    );
  }
}

/**
 * @class Triangle2D
 * @description Represents a triangle 2D shape
 */
class Triangle2D extends Drawable {
  constructor() {
    const vertices = [0.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    const verticesBuffer = initVertexBuffer(GLManager.getGL(), vertices);

    const textureCoordinates = [0.5, 1.0, 1.0, 0.0, 0.0, 0.0];
    const texCoordBuffer = initVertexBuffer(
      GLManager.getGL(),
      textureCoordinates
    );

    super(
      GLManager.getGL(),
      GLManager.getProgramInfo(),
      verticesBuffer,
      texCoordBuffer,
      vertices,
      false,
      "",
      0,
      0,
      0,
      0,
      0,
      false
    );
  }
}

/**
 * @class Circle2D
 * @description Represents a circle 2D shape
 * @param {number} segments - The number of segments to use to draw the circle
 */
class Circle2D extends Drawable {
  constructor(segments = 32) {
    const radius = 1.0;
    const vertices = [];
    const textureCoordinates = [];

    // Add center vertex
    vertices.push(0, 0);
    textureCoordinates.push(0.5, 0.5);

    // Add perimeter vertices
    for (let i = 0; i <= segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      vertices.push(x, y);
      textureCoordinates.push((x / radius + 1) / 2, (y / radius + 1) / 2);
    }

    const verticesBuffer = initVertexBuffer(GLManager.getGL(), vertices);
    const texCoordBuffer = initVertexBuffer(
      GLManager.getGL(),
      textureCoordinates
    );

    super(
      GLManager.getGL(),
      GLManager.getProgramInfo(),
      verticesBuffer,
      texCoordBuffer,
      vertices,
      false,
      "",
      0,
      0,
      0,
      0,
      0,
      false,
      true,
      false
    );
  }
}

export { Square2D, Triangle2D, Circle2D };
