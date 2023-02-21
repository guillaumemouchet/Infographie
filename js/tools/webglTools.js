import {ShaderProgram} from "./shaderProgram.js";

class WebglTools {
    static glContext = null;
    static canvasWidth = 0;
    static canvasHeight = 0;
    static program = null;

    static degToRad(degrees) {
        return (degrees * Math.PI / 180.0);
    }

    /**
     * Allow to initialize Shaders.
     */
    static getShaderFromHTML(gl, id) {
        let script = document.getElementById(id);
        if (!script) {
            return null;
        }

        let str = "";
        let k = script.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        return str;
    }

    /**
     * The program contains a series of instructions that tell the Graphic Processing Unit (GPU)
     * what to do with every vertex and fragment that we transmit.
     * The vertex shader and the fragment shaders together are called through that program.
     * @returns {ShaderProgram}
     */
    static initProgramFromHTML() {
        let fgShader = this.getShaderFromHTML(this.glContext, "shader-fs");
        let vxShader = this.getShaderFromHTML(this.glContext, "shader-vs");

        let program = new ShaderProgram(this.glContext, [vxShader], [fgShader]);

        this.glContext.useProgram(program.program);

        this.program = program

        return program;
    }

    static async initProgramFromFiles(vsFilenames, fsFilenames) {
        let vsSource = []
        for (const fileName of vsFilenames) {
            vsSource.push(await getSource(fileName));
        }
        let fsSource = []
        for (const fileName of fsFilenames) {
            fsSource.push(await getSource(fileName));
        }

        let program = new ShaderProgram(this.glContext, vsSource, fsSource);

        this.glContext.useProgram(program.program);

        this.program = program;

        return program;

        async function getSource(fileName) {
            let response = await fetch(fileName)
            return await response.text();
        }
    }

    /**
     * Verify that WebGL is supported by your machine
     * @param canvasName
     * @returns {WebGL2RenderingContext}
     */
    static getGLContext(canvasName) {
        let canvas = document.getElementById(canvasName);
        if (canvas == null) {
            alert("there is no canvas on this page");
            return;
        } else {
            this.canvasWidth = canvas.width;
            this.canvasHeight = canvas.height;
        }

        let gl = null;
        let names = ["webgl2",
            "webkit-3d"
        ];

        for (let i = 0; i < names.length; i++) {
            try {
                gl = canvas.getContext(names[i]); // no blending

                //*** for transparency (Blending) ***
                //gl = canvas.getContext(names[i], {premultipliedAlpha: false});
                //gl.enable(gl.BLEND);
                //gl.blendEquation(gl.FUNC_ADD);
                //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);			
            } catch (e) {
            }

            if (gl) break;
        }

        if (gl == null) {
            alert("WebGL is not available");
            throw new Error("WebGL is not available");
        } else {
            this.glContext = gl;
            return gl;
        }
    }


    /**
     * The following code snippet creates a vertex buffer and binds the vertices to it.
     */
    static getVertexBufferWithVertices(vertices) {
        let vBuffer = this.glContext.createBuffer();
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, vBuffer);
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(vertices), this.glContext.STATIC_DRAW);
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);

        return vBuffer;
    }

    /**
     * The following code snippet creates a vertex buffer and binds the indices to it.
     */
    static getIndexBufferWithIndices(indices) {
        let iBuffer = this.glContext.createBuffer();
        this.glContext.bindBuffer(this.glContext.ELEMENT_ARRAY_BUFFER, iBuffer);
        this.glContext.bufferData(this.glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.glContext.STATIC_DRAW);
        this.glContext.bindBuffer(this.glContext.ELEMENT_ARRAY_BUFFER, null);

        return iBuffer;
    }


    static getArrayBufferWithArray(values) {
        //The following code snippet creates an array buffer and binds the array values to it
        let vBuffer = this.glContext.createBuffer();
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, vBuffer);
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(values), this.glContext.STATIC_DRAW);
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);

        return vBuffer;
    }

    static async initTextureWithImage(sFilename, mipmap = false) {
        let textureBuffer = this.glContext.createTexture();

        let image = new Image();
        image.src = sFilename;
        await image.decode();

        this.glContext.bindTexture(this.glContext.TEXTURE_2D, textureBuffer);
        this.glContext.pixelStorei(this.glContext.UNPACK_FLIP_Y_WEBGL, true);
        this.glContext.texImage2D(this.glContext.TEXTURE_2D, 0, this.glContext.RGBA, this.glContext.RGBA, this.glContext.UNSIGNED_BYTE, image);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_MIN_FILTER, this.glContext.NEAREST);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_MAG_FILTER, this.glContext.NEAREST);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_WRAP_S, this.glContext.REPEAT);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_WRAP_T, this.glContext.REPEAT);

        if (mipmap) this.glContext.generateMipmap(this.glContext.TEXTURE_2D);

        this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);

        return textureBuffer;
    }

    static init1by1Texture(color = [255,255,255,255], mipmap = false) {
        let textureBuffer = this.glContext.createTexture();

        this.glContext.bindTexture(this.glContext.TEXTURE_2D, textureBuffer);
        this.glContext.texImage2D(this.glContext.TEXTURE_2D, 0, this.glContext.RGBA, 1,1, 0, this.glContext.RGBA, this.glContext.UNSIGNED_BYTE, new Uint8Array(color));
        this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);

        return textureBuffer;
    }

    static async loadCubemap(posX, negX, posY, negY, posZ, negZ) {
        let texture = this.glContext.createTexture();
        this.glContext.bindTexture(this.glContext.TEXTURE_CUBE_MAP, texture);

        const faceInfos = [
            {
                target: this.glContext.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: posX,
            },
            {
                target: this.glContext.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: negX,
            },
            {
                target: this.glContext.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: posY,
            },
            {
                target: this.glContext.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url: negY,
            },
            {
                target: this.glContext.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: posZ,
            },
            {
                target: this.glContext.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: negZ,
            },
        ];

        for await (const faceInfo of faceInfos) {
            const {target, url} = faceInfo;

            let image = new Image();
            image.src = url;
            await image.decode();

            this.glContext.pixelStorei(this.glContext.UNPACK_FLIP_Y_WEBGL, false);
            this.glContext.bindTexture(this.glContext.TEXTURE_CUBE_MAP, texture);
            this.glContext.texImage2D(target, 0, this.glContext.RGBA, this.glContext.RGBA, this.glContext.UNSIGNED_BYTE, image);

        }
        this.glContext.generateMipmap(this.glContext.TEXTURE_CUBE_MAP);
        this.glContext.texParameteri(this.glContext.TEXTURE_CUBE_MAP, this.glContext.TEXTURE_MIN_FILTER, this.glContext.LINEAR_MIPMAP_LINEAR);


        return texture;
    }

    static temp_calculateTangents(v, uv, ind){

        let tangents = new Array(v.length/3);

        // Calculate tangents
        for (let i = 0; i < ind.length; i += 3) {

            let edge1 = [0, 0, 0], edge2 = [0, 0, 0];
            let deltaUV1 = [0, 0, 0], deltaUV2 = [0, 0, 0];
            let tangent = [0, 0, 0];
            let bitangent = [0, 0, 0];

            let i0 = ind[i + 0];
            let i1 = ind[i + 1];
            let i2 = ind[i + 2];

            let pos0 = [v[i0 * 3], v[i0 * 3 + 1], v[i0 * 3 + 2]];
            let pos1 = [v[i1 * 3], v[i1 * 3 + 1], v[i1 * 3 + 2]];
            let pos2 = [v[i2 * 3], v[i2 * 3 + 1], v[i2 * 3 + 2]];

            let tex0 = [uv[i0 * 2], uv[i0 * 2 + 1]];
            let tex1 = [uv[i1 * 2], uv[i1 * 2 + 1]];
            let tex2 = [uv[i2 * 2], uv[i2 * 2 + 1]];

            glMatrix.vec3.subtract(edge1, pos1, pos0);
            glMatrix.vec3.subtract(edge2, pos2, pos0);
            glMatrix.vec3.subtract(deltaUV1, tex1, tex0);
            glMatrix.vec3.subtract(deltaUV2, tex2, tex0);

            let f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);

            tangent[0] = f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]);
            tangent[1] = f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]);
            tangent[2] = f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2]);

            glMatrix.vec3.normalize(tangent,tangent);
            tangents[i0] = tangent;
            tangents[i1] = tangent;
            tangents[i2] = tangent;
        }

        return tangents.flat();
    }

    /**
     * https://webgl2fundamentals.org/webgl/lessons/webgl-load-obj-w-mtl.html
     * @param position
     * @param texcoord
     * @param indices
     * @returns {*[]}
     */
    static generateTangents(position, texcoord, indices) {
        const getNextIndex = indices ? makeIndexIterator(indices) : makeUnindexedIterator(position);
        const numFaceVerts = getNextIndex.numElements;
        const numFaces = numFaceVerts / 3;

        const tangents = [];
        for (let i = 0; i < numFaces; ++i) {
            const n1 = getNextIndex();
            const n2 = getNextIndex();
            const n3 = getNextIndex();

            const p1 = position.slice(n1 * 3, n1 * 3 + 3);
            const p2 = position.slice(n2 * 3, n2 * 3 + 3);
            const p3 = position.slice(n3 * 3, n3 * 3 + 3);

            const uv1 = texcoord.slice(n1 * 2, n1 * 2 + 2);
            const uv2 = texcoord.slice(n2 * 2, n2 * 2 + 2);
            const uv3 = texcoord.slice(n3 * 2, n3 * 2 + 2);

            const dp12 = glMatrix.vec3.create();
            const dp13 = glMatrix.vec3.create();
            glMatrix.vec3.subtract(dp12, p2, p1);
            glMatrix.vec3.subtract(dp13, p3, p1);

            const duv12 = glMatrix.vec3.create();
            const duv13 = glMatrix.vec3.create();
            glMatrix.vec3.subtract(duv12, uv2, uv1);
            glMatrix.vec3.subtract(duv13, uv3, uv1);


            const f = 1.0 / (duv12[0] * duv13[1] - duv13[0] * duv12[1]);
            const tangent = Number.isFinite(f)
                ? glMatrix.vec3.normalize(glMatrix.vec3.create(),glMatrix.vec3.scale(glMatrix.vec3.create(),glMatrix.vec3.subtract(glMatrix.vec3.create(),
                    glMatrix.vec3.scale(glMatrix.vec3.create(), dp12, duv13[1]),
                    glMatrix.vec3.scale(glMatrix.vec3.create(), dp13, duv12[1])
                ), f))
                : [1, 0, 0];

            tangents.push(...tangent, ...tangent, ...tangent);
        }

        return tangents;

        function makeIndexIterator(indices) {
            let ndx = 0;
            const fn = () => indices[ndx++];
            fn.reset = () => { ndx = 0; };
            fn.numElements = indices.length;
            return fn;
        }

        function makeUnindexedIterator(positions) {
            let ndx = 0;
            const fn = () => ndx++;
            fn.reset = () => { ndx = 0; };
            fn.numElements = positions.length / 3;
            return fn;
        }
    }

    static calculateTangents(v, uv, ind) {

        let i;
        let tangents = [];
        for (i = 0; i < v.length / 3; i++) {
            tangents[i] = [0, 0, 0];
        }
        // Calculate tangents
        let a = [0, 0, 0],
            b = [0, 0, 0];
        let triTangent = [0, 0, 0];
        for (i = 0; i < ind.length; i += 3) {

            let i0 = ind[i + 0];
            let i1 = ind[i + 1];
            let i2 = ind[i + 2];

            let pos0 = [v[i0 * 3], v[i0 * 3 + 1], v[i0 * 3 + 2]];
            let pos1 = [v[i1 * 3], v[i1 * 3 + 1], v[i1 * 3 + 2]];
            let pos2 = [v[i2 * 3], v[i2 * 3 + 1], v[i2 * 3 + 2]];

            let tex0 = [uv[i0 * 2], uv[i0 * 2 + 1]];
            let tex1 = [uv[i1 * 2], uv[i1 * 2 + 1]];
            let tex2 = [uv[i2 * 2], uv[i2 * 2 + 1]];

            glMatrix.vec3.subtract(a, pos1, pos0);
            glMatrix.vec3.subtract(b, pos2, pos0);

            let c2c1t = tex1[0] - tex0[0];
            let c2c1b = tex1[1] - tex0[1];
            let c3c1t = tex2[0] - tex0[0];
            let c3c1b = tex2[0] - tex0[1];

            triTangent = [c3c1b * a[0] - c2c1b * b[0], c3c1b * a[1] - c2c1b * b[1], c3c1b * a[2] - c2c1b * b[2]];

            glMatrix.vec3.add(tangents[i0],tangents[i0], triTangent);
            glMatrix.vec3.add(tangents[i1],tangents[i1], triTangent);
            glMatrix.vec3.add(tangents[i2],tangents[i2], triTangent);
        }

        // Normalize tangents
        let ts = [];
        for (i = 0; i < tangents.length; i++) {
            let tan = tangents[i];
            glMatrix.vec3.normalize(tan,tan);

            ts.push(tan[0]);
            ts.push(tan[1]);
            ts.push(tan[2]);

        }

        return ts;
    }
}

export default WebglTools;
