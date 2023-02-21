import "../../lib/gl-matrix.js";
import WebglTools from "../webglTools.js";

class Material{
    constructor(name) {
        this.name = name;
        this.diffuseColor = [1.0, 1.0, 1.0];
        this.colorMap = WebglTools.init1by1Texture([255,255,255,255]);
        this.specularMap = WebglTools.init1by1Texture([255,255,255,255]);
        this.normalMap = WebglTools.init1by1Texture([127,127,255,0]);
        this.heightMap = WebglTools.init1by1Texture([0,0,0,0]);
    }
}

class Object3D {
    #children;
    #colors;
    #indices;
    #localModelMatrix;
    #name;
    #normals;
    #parent;
    #position;
    #rotation;
    #scale;
    #tangents
    #uvCoords;
    #vertices;

    constructor(position = [0, 0, 0], scale = [1, 1, 1]) {
        this.#parent = null;
        this.#children = [];
        this.#name = null;

        this.#position = glMatrix.vec3.fromValues(
            position[0],
            position[1],
            position[2]
        )

        this.#scale = glMatrix.vec3.fromValues(
            scale[0],
            scale[1],
            scale[2]
        );

        this.#rotation = glMatrix.quat.create();
        this.#localModelMatrix = glMatrix.mat4.create();

        //Initialization of the buffers within the object
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.normalBuffer = null;
        this.tangentBuffer = null;
        this.colorBuffer = null;
        this.uvCoordsBuffer = null

        this.material = null;
    }

    /**
     * @returns {glMatrix.vec3}
     */
    get position() {
        return this.#position;
    }

    /**
     * @param {glMatrix.vec3} value
     */
    set position(value) {
        this.#position = value;
        this.updateModelMatrix();
    }

    /**
     * @returns {glMatrix.vec3}
     */
    get scale() {
        return this.#scale;
    }

    /**
     * @param {glMatrix.vec3} value
     */
    set scale(value) {
        this.#scale = value;
        this.updateModelMatrix();
    }

    /**
     * @returns {glMatrix.quat}
     */
    get rotation() {
        return this.#rotation;
    }

    /**
     * @param {glMatrix.quat} value
     */
    set rotation(value) {
        this.#rotation = value;
        this.updateModelMatrix();
    }

    get indices() {
        return this.#indices;
    }

    set indices(value) {
        this.#indices = value;
        this.indexBuffer = WebglTools.getIndexBufferWithIndices(this.#indices);
    }

    get vertices() {
        return this.#vertices;
    }

    set vertices(value) {
        this.#vertices = value;
        this.vertexBuffer = WebglTools.getVertexBufferWithVertices(this.#vertices);
    }

    get normals() {
        return this.#normals;
    }

    set normals(value) {
        this.#normals = value;
        this.normalBuffer = WebglTools.getArrayBufferWithArray(this.#normals);
    }

    get tangents() {
        return this.#tangents;
    }

    set tangents(value) {
        this.#tangents = value;
        this.tangentBuffer = WebglTools.getArrayBufferWithArray(this.#tangents);
    }

    get colors() {
        return this.#colors;
    }

    set colors(value) {
        this.#colors = value;
        this.colorBuffer = WebglTools.getArrayBufferWithArray(this.#colors);
    }

    get uvCoords() {
        return this.#uvCoords;
    }

    set uvCoords(value) {
        this.#uvCoords = value;
        this.uvCoordsBuffer = WebglTools.getArrayBufferWithArray(this.#uvCoords);
    }

    get parent() {
        return this.#parent;
    }

    set parent(value) {
        this.#parent = value;
    }

    get children() {
        return this.#children;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = value;
    }

    /**
     * @returns {glMatrix.quat}
     */
    get modelMatrix() {
        return this.#localModelMatrix;
    }

    /**
     * @param {glMatrix.mat4} value
     */
    set modelMatrix(value) {
        this.#localModelMatrix = value;
        glMatrix.mat4.getTranslation(this.position, this.#localModelMatrix);
        glMatrix.mat4.getRotation(this.#rotation, this.#localModelMatrix);
        glMatrix.mat4.getScaling(this.scale, this.#localModelMatrix);
    }

    updateModelMatrix() {
        //Defines the position matrix of the object
        glMatrix.mat4.identity(this.#localModelMatrix);

        if (this.parent != null)
            glMatrix.mat4.multiply(
                this.#localModelMatrix,
                this.#localModelMatrix,
                this.parent.modelMatrix
            );

        // /!\ Beware!! Scale first, rotate and then translate
        // => the inverse in the matrix product: write translate then rotate and scale :-)
        glMatrix.mat4.translate(
            this.#localModelMatrix,
            this.#localModelMatrix,
            glMatrix.vec3.clone(this.#position)
        );

        let quatMat = glMatrix.mat4.create();
        glMatrix.mat4.fromQuat(quatMat, this.#rotation);
        glMatrix.mat4.multiply(this.#localModelMatrix, this.#localModelMatrix, quatMat);

        glMatrix.mat4.scale(
            this.#localModelMatrix,
            this.#localModelMatrix,
            glMatrix.vec3.clone(this.#scale)
        );

        // RECURSIVE CALL TO UPDATE THE CHILDREN OBJECT
        for (const child of this.#children) {
            child.updateModelMatrix();
        }
    }
}

class Model extends Object3D{
    constructor(name) {
        super();
        this.name = name;
        this.materials = [];
    }
}

export default Object3D;

export {Object3D, Material, Model};
