import WebglTools from "../webglTools.js";
import Object3D from "./object3D.js";

class Sphere extends Object3D {
  /**
   * class handling the Sphere object
   * @param radius - radius of the Sphere
   * @param sphereDivisions - number of divisions of the Sphere
   * @param color - color of the Sphere
   * @param position - position of the Sphere
   */
  constructor(radius, sphereDivisions, color, position = [0, 0, 0]) {
    super(position);
    this.radius = radius;
    this.color = color;

    //Static definition of the subdivision of the perimeter of the sphere to create the various points for the vertices
    this.division = sphereDivisions;

    //Call of the Initialization method
    this.init();
  }

  init() {
    let latitudeBands = this.division;
    let longitudeBands = this.division;
    let x = 0.0;
    let y = 0.0;
    let z = 0.0;
    let theta = 0.0;
    let sinTheta = 0.0;
    let cosTheta = 0.0;
    let phi = 0.0;
    let sinPhi = 0.0;
    let cosPhi = 0.0;

    let vertices = [];
    let colors = [];
    let indices = [];

    // Generate vertices
    for (let latNumber = 0; latNumber <= latitudeBands; ++latNumber) {
      theta = (latNumber * Math.PI) / latitudeBands;
      sinTheta = Math.sin(theta);
      cosTheta = Math.cos(theta);
      for (let longNumber = 0; longNumber <= longitudeBands; ++longNumber) {
        phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
        sinPhi = Math.sin(phi);
        cosPhi = Math.cos(phi);
        x = sinTheta * sinPhi;
        y = cosTheta;
        z = sinTheta * cosPhi;
        vertices.push(x);
        vertices.push(y);
        vertices.push(z);
        colors.push(this.color.r, this.color.g, this.color.b, 1.0);
      }
    }

    // Generate indices
    let first = 0;
    let second = 0;
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
        first = latNumber * (longitudeBands + 1) + longNumber;
        second = first + longitudeBands + 1;
        indices.push(first);
        indices.push(second);
        indices.push(first + 1);
        indices.push(second);
        indices.push(second + 1);
        indices.push(first + 1);
      }
    }

    this.vertices = vertices;
    this.colors = colors;
    this.indices = indices;

    //Converts the values to buffers
    this.vertexBuffer = WebglTools.getVertexBufferWithVertices(this.vertices);
    this.colorBuffer = WebglTools.getVertexBufferWithVertices(this.colors);
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

export default Sphere;
