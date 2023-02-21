import WebglTools from "../webglTools.js";
import Object3D from "./object3D.js";

class Disk extends Object3D {
    /**
     * class handling the Disk object
     * @param radius - radius of the Disk
     * @param color - color of the Disk
     * @param position - position of the Disk
     */
    constructor(radius, subdivision, color, position = [0, 0, 0]) {
        super(position);

        this.radius = radius;
        this.color = color;

        //Static definition of the subdivision of the perimeter of the disk to create the various points for the vertices
        this.division = subdivision;

        //Call of the Initialization method
        this.init();
    }

    updateModelMatrix() {
        super.updateModelMatrix();
        glMatrix.mat4.scale(
            this.modelMatrix,
            this.modelMatrix,
            glMatrix.vec3.fromValues(this.radius, this.radius, this.radius)
        );
    }

    //Initialization method of a disk object
    init() {
        let vertices = [];
        let colors = [];
        let indices = [];

        //Defining the center point of the circle
        vertices.push(0.0, 0.0, 0.0);

        //Based on division, generates the various vertices for the circle
        for (let i = 0; i < 360; i += 360 / this.division) {
            vertices.push(
                Math.sin(glMatrix.glMatrix.toRadian(i)),
                Math.cos(glMatrix.glMatrix.toRadian(i)),
                0.0
            );
        }

        //And defines the same color for each of the vertices
        for (let i = 0; i < this.division + 1; i++) {
            colors.push(this.color.r, this.color.g, this.color.b, 1.0);
        }

        //Definies the indexes for the objects, used to link each point
        for (let i = 0; i < this.division - 1; i++) {
            indices.push(0, i + 1, i + 2);
        }
        //and links the last vertices
        indices.push(0, this.division, 1);

        this.vertices = vertices;
        this.colors = colors;
        this.indices = indices

        //Converts the values to buffers
        this.vertexBuffer = WebglTools.getVertexBufferWithVertices(this.vertices);
        this.colorBuffer = WebglTools.getVertexBufferWithVertices(this.colors);
        this.indexBuffer = WebglTools.getIndexBufferWithIndices(this.indices);

        // this.updatePosition(this.x, this.y, this.z);
        this.updateModelMatrix();
    }
}

export default Disk;
