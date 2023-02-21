import WebglTools from "../webglTools.js";
import Object3D from "./object3D.js";

class Icosahedron extends Object3D {

  constructor(radius, subdivision, color, position = [0, 0, 0]) {
    super(position);

    this.radius = radius;
    this.color = color;
    this.subdivision = subdivision;

    //Call of the Initialization method
    this.init();
  }

  //Initialization method of a planet object
  init() {
    this.clearBuffers();

    //Initialisation of the arrays used to construct the object
    this.indices = [];
    this.vertices = [];
    this.uvCoords = [];
    this.colors = [];

    //We define the index "count" at 0
    this.indexCnt = 0;

    //Initialisation of the icosahedron
    this.initIcosahedron();

    //Converts the values to buffers
    this.vertexBuffer = WebglTools.getVertexBufferWithVertices(this.vertices);
    this.colorBuffer = WebglTools.getVertexBufferWithVertices(this.colors);
    this.uvCoordsBuffer = WebglTools.getVertexBufferWithVertices(this.uvCoords);
    this.indexBuffer = WebglTools.getIndexBufferWithIndices(this.indices);
  }

  //Initialisation of the icosahedron
  initIcosahedron() {
    //We define the components to draw the base icosahedron, see :
    //And we take into account the radius of each sphere.
    const X = 0.525731112119133696;
    const Z = 0.850650808352039932;
    //We create each base vertex
    let icosahedronvertex = [];
    icosahedronvertex.push(-X, 0.0, Z);
    icosahedronvertex.push(X, 0.0, Z);
    icosahedronvertex.push(-X, 0.0, -Z);
    icosahedronvertex.push(X, 0.0, -Z);
    icosahedronvertex.push(0.0, Z, X);
    icosahedronvertex.push(0.0, Z, -X);
    icosahedronvertex.push(0.0, -Z, X);
    icosahedronvertex.push(0.0, -Z, -X);
    icosahedronvertex.push(Z, X, 0.0);
    icosahedronvertex.push(-Z, X, 0.0);
    icosahedronvertex.push(Z, -X, 0.0);
    icosahedronvertex.push(-Z, -X, 0.0);
    //We create each base index
    let icosahedrontriangle = [];
    icosahedrontriangle.push(1, 4, 0);
    icosahedrontriangle.push(4, 9, 0);
    icosahedrontriangle.push(4, 5, 9);
    icosahedrontriangle.push(8, 5, 4);
    icosahedrontriangle.push(1, 8, 4);
    icosahedrontriangle.push(1, 10, 8);
    icosahedrontriangle.push(10, 3, 8);
    icosahedrontriangle.push(8, 3, 5);
    icosahedrontriangle.push(3, 2, 5);
    icosahedrontriangle.push(3, 7, 2);
    icosahedrontriangle.push(3, 10, 7);
    icosahedrontriangle.push(10, 6, 7);
    icosahedrontriangle.push(6, 11, 7);
    icosahedrontriangle.push(6, 0, 11);
    icosahedrontriangle.push(6, 1, 0);
    icosahedrontriangle.push(10, 1, 6);
    icosahedrontriangle.push(11, 0, 9);
    icosahedrontriangle.push(2, 11, 9);
    icosahedrontriangle.push(5, 2, 9);
    icosahedrontriangle.push(11, 2, 7);
    //Foreach point
    for (let i = 0; i < icosahedrontriangle.length; i += 3) {
      //We create 3 empty vectors
      let v1 = [];
      let v2 = [];
      let v3 = [];
      //Retrive the base index
      let vertexIndexStart = icosahedrontriangle[i] * 3;
      //We define v1, a point/vector of the current triangle
      v1.push(
        icosahedronvertex[vertexIndexStart],
        icosahedronvertex[vertexIndexStart + 1],
        icosahedronvertex[vertexIndexStart + 2]
      );
      vertexIndexStart = icosahedrontriangle[i + 1] * 3;
      //We define v2, a point/vector of the current triangle
      v2.push(
        icosahedronvertex[vertexIndexStart],
        icosahedronvertex[vertexIndexStart + 1],
        icosahedronvertex[vertexIndexStart + 2]
      );
      vertexIndexStart = icosahedrontriangle[i + 2] * 3;
      //we define v3, a point/vector of the current triangle
      v3.push(
        icosahedronvertex[vertexIndexStart],
        icosahedronvertex[vertexIndexStart + 1],
        icosahedronvertex[vertexIndexStart + 2]
      );
      //We start the recursive subdivision of the selected triangle
      this.fromOneToFourTriangles(v1, v2, v3, this.subdivision);
    }
  }

  //Subdivision function to generate the sphere with an icosahedron
  fromOneToFourTriangles(v1, v2, v3, depth) {
    //Declaration of temporary arrays for each subdivision
    let v12 = [];
    let v23 = [];
    let v31 = [];

    let tu1 = 0;
    let tv1 = 0;
    let tu2 = 0;
    let tv2 = 0;
    let tu3 = 0;
    let tv3 = 0;

    //If we arrived at the end of the recursive subdivision
    if (depth == 0) {
      //We store all the vertices, colors and indexes
      this.vertices.push(v1[0], v1[1], v1[2]);
      this.indices.push(this.indexCnt);
      this.colors.push(this.color.r, this.color.g, this.color.b, 1.0);

      this.vertices.push(v2[0], v2[1], v2[2]);
      this.indices.push(this.indexCnt + 1);
      this.colors.push(this.color.r, this.color.g, this.color.b, 1.0);

      this.vertices.push(v3[0], v3[1], v3[2]);
      this.indices.push(this.indexCnt + 2);
      this.colors.push(this.color.r, this.color.g, this.color.b, 1.0);

      this.indexCnt += 3;

      /***************************************************
       *	We calculate the texture coordinates for each point
       *	http://vterrain.org/Textures/spherical.html
       *	http://www.progonos.com/furuti/MapProj/Normal/ProjPoly/Foldout/Icosahedron/
       ***************************************************/

      tu1 = 0.5 + (Math.atan2(v1[0], v1[2])) / (Math.PI * 2);
      tv1 = 0.5 + (Math.asin(v1[1])) / Math.PI;
      tu2 = 0.5 + (Math.atan2(v2[0], v2[2])) / (Math.PI * 2);
      tv2 = 0.5 + (Math.asin(v2[1])) / Math.PI;
      tu3 = 0.5 + (Math.atan2(v3[0], v3[2])) / (Math.PI * 2);
      tv3 = 0.5 + (Math.asin(v3[1])) / Math.PI;

      let ecart = 0.7;

      if(Math.abs(tu1 - tu2) > ecart || Math.abs(tu1 - tu3) > ecart || Math.abs(tu2 - tu3) > ecart)
      {
        if(tu1 > ecart){
          if(tu2 > ecart){
            tu3 += 1;
          }
          else if(tu3 > ecart){
            tu2 += 1;
          }
          else{
            tu1 -= 1;
          }
        }
        else if(tu2 > ecart){
          if(tu1 > ecart){
            tu3 += 1;
          }
          else if(tu3 > ecart){
            tu1 += 1;
          }
          else{
            tu2 -= 1;
          }
        }
        else if(tu3 > ecart){
          if(tu1 > ecart){
            tu2 += 1;
          }
          else if(tu2 > ecart){
            tu1 += 1;
          }
          else{
            tu3 -= 1;
          }
        }
      }
      //We push the texture coordinates for each corresponding vertice
      this.uvCoords.push(tu1, tv1);
      this.uvCoords.push(tu2, tv2);
      this.uvCoords.push(tu3, tv3);

    } else {
      //If we are still subdividing
      //We define 3 vectors per component (x,y,z) for each triangle based on the previous one
      for (let i = 0; i < 3; i++) {
        v12.push((v1[i] + v2[i]) / 2.0);
        v23.push((v2[i] + v3[i]) / 2.0);
        v31.push((v3[i] + v1[i]) / 2.0);
      }
      //We normalize the 3 new triangles based on the vectors
      v12 = normalize(v12);
      v23 = normalize(v23);
      v31 = normalize(v31);

      //We subdivised our new triangles
      this.fromOneToFourTriangles(v1, v12, v31, depth - 1);
      this.fromOneToFourTriangles(v2, v23, v12, depth - 1);
      this.fromOneToFourTriangles(v3, v31, v23, depth - 1);
      this.fromOneToFourTriangles(v12, v23, v31, depth - 1);
    }

    //Function to normalize a vector
    function normalize(v, radius = 1.0) {
      let d = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      if (d != 0.0) {
        v[0] = (v[0] / d) * radius;
        v[1] = (v[1] / d) * radius;
        v[2] = (v[2] / d) * radius;
      }
      return v;
    }
  }

  //This method clears the buffer
  clearBuffers() {
    if (this.vertexBuffer != null) {
      WebglTools.glContext.deleteBuffer(this.vertexBuffer);
    }
    if(this.uvCoordsBuffer != null)
    {
      WebglTools.glContext.deleteBuffer(this.uvCoordsBuffer);
    }
    if (this.colorBuffer != null) {
      WebglTools.glContext.deleteBuffer(this.colorBuffer);
    }
    if (this.indexBuffer != null) {
      WebglTools.glContext.deleteBuffer(this.indexBuffer);
    }
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

export default Icosahedron;
