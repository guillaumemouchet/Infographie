import WebglTools from "../webglTools.js";
import Object3D from "./object3D.js";

class CatmullRomSphere extends Object3D {
    /**
     * class handling the Catmull Rom Sphere object
     * @param radius - radius of the Sphere
     * @param sphereDivisions - number of divisions of the Sphere
     * @param color - color of the Sphere
     * @param position - position of the Sphere
     */
    constructor(
        radius,
        sphereDivisions,
        verticalSlices,
        color,
        position = [0, 0, 0]
    ) {
        super(position);

        this.radius = radius;
        this.color = color;
        this.division = sphereDivisions;
        this.verticalSlices = verticalSlices;

        //Call of the Initialization method
        this.init();
    }

    //Initialization method of a planet object
    init() {
        this.clearBuffers();

        //Initialization of the arrays used to construct the object
        this.indices = [];
        this.vertices = [];
        this.colors = [];
        //Generation of points in circle to render the circles based on. Play with this to better understand how it works
        for (let i = 0.0; i <= this.division; i++) {
            //this.vertices.push(1.0/this._division * i, 0, 0);
            this.vertices.push((1.0 / this.division) * i, 0, 0);
            this.indices.push(i);
            this.colors.push(this.color.r, this.color.g, this.color.b, 1.0);
        }

        //Converts the values to buffers
        this.vertexBuffer = WebglTools.getVertexBufferWithVertices(this.vertices);
        this.colorBuffer = WebglTools.getVertexBufferWithVertices(this.colors);
        this.indexBuffer = WebglTools.getIndexBufferWithIndices(this.indices);

        this.initCatmull();
    }

    //Initialization of the cattmull points
    initCatmull() {
        //Initialization of the arrays used to calculate catmull rom
        this.points = [];
        this.colorPoints = [];
        this.indicesPoints = [];

        this.angleMatrixTab = [];
        //Creation of the values to render the cattmull rom circle
        let deltaDegreeValue = 360 / this.division;
        for (let i = 0; i < 360; i += deltaDegreeValue) {
            this.points.push(
                this.radius * Math.sin(glMatrix.glMatrix.toRadian(i)),
                this.radius * Math.cos(glMatrix.glMatrix.toRadian(i)),
                0.5
            );
            this.colorPoints.push(this.color.r, this.color.g, this.color.b, 1.0);
            this.indicesPoints.push(this.indicesPoints.length);
        }

        //Calculates the angle to rotate each slice
        let angle = 360 / this.verticalSlices;

        //Generation of each rotation matrix for the rendering
        for (let i = 0; i < this.verticalSlices; i++) {
            //We rotate the object by the angle
            let angleMatrix = glMatrix.mat4.create();
            glMatrix.mat4.rotateY(
                angleMatrix,
                angleMatrix,
                glMatrix.glMatrix.toRadian(angle * i)
            );
            this.angleMatrixTab.push(angleMatrix);
        }

        //Push of the first index to complete the circle
        this.indicesPoints.push(0);
    }

    //This method clears the buffer
    clearBuffers() {
        if (this.vertexBuffer != null) {
            WebglTools.glContext.deleteBuffer(this.vertexBuffer);
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

export default CatmullRomSphere;
