import Object3D from "./object3D.js";
import WebglTools from "../webglTools.js";

class PerfectSphere extends Object3D {
  constructor(radius, color, position = [0, 0, 0]) {
    super(position);

    this.radius = radius;
    this.color = color;

    this.init();
  }

  init() {
    // this.colors.concat(this.color, this.color, this.color);
    this.colors = [
      this.color.r,
      this.color.g,
      this.color.b,
      1.0,
      this.color.r,
      this.color.g,
      this.color.b,
      1.0,
      this.color.r,
      this.color.g,
      this.color.b,
      1.0,
      this.color.r,
      this.color.g,
      this.color.b,
      1.0
    ];
    this.vertices = [
      -1.0,
      -1.0,
      0.0,

      1.0,
      -1.0,
      0.0,

      -1.0,
      1.0,
      0.0,

      1.0,
      1.0,
      0.0
    ];
    this.uvCoords = [0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0];
    this.indices = [0, 1, 2, 3];

    //Converts the values to buffers
    this.vertexBuffer = WebglTools.getVertexBufferWithVertices(this.vertices);
    this.colorBuffer = WebglTools.getVertexBufferWithVertices(this.colors);
    this.uvCoordsBuffer = WebglTools.getArrayBufferWithArray(this.uvCoords);
    this.indexBuffer = WebglTools.getIndexBufferWithIndices(this.indices);

    this.updateModelMatrix();
  }

  updateModelMatrix() {
    super.updateModelMatrix();
    glMatrix.mat4.scale(
      this.modelMatrix,
      this.modelMatrix,
      glMatrix.vec3.fromValues(this.radius, this.radius, this.radius)
    );
  }
}

export default PerfectSphere;
