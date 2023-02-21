import WebglTools from "./webglTools.js";

class ShaderProgram {
    #REGEX_UNIFORM = /^\W*\buniform[^;]+[ ](\w+);/gm;
    #MATCH_UNIFORM_NAME = /^\W*\buniform[^;]+[ ](\w+);/;

    #REGEX_ATTRIBUTE = /^\W*\bin[^;]+[ ](\w+);/gm;
    #MATCH_ATTRIBUTE_NAME = /^\W*\bin[^;]+[ ](\w+);/;

    program;
    vertexSrc;
    fragmentSrc;
    uniforms;
    attributes;

    /**
     * Create a Shader Material / Program
     * @param gl
     * @param vertexShaders
     * @param fragmentShaders
     * @param uniforms
     */
    constructor(
        gl,
        vertexShaders,
        fragmentShaders,
        uniforms = {},
        attributes = {},
    ) {
        this.uniforms = {};
        this.attributes = {};

        this.vertexSrc = vertexShaders.join("\n");
        this.fragmentSrc = fragmentShaders.join("\n");

        this.program = this.#createProgram(gl, this.vertexSrc, this.fragmentSrc);

        this.#lookupUniforms(gl, this.vertexSrc, this.fragmentSrc);
        this.#lookupAttributes(gl, this.vertexSrc);

        // Set uniform values
        for (const [key, value] of Object.entries(uniforms)) {
            if (key in this.uniforms) {
                this.uniforms[key].value = value;
            } else {
                console.warn(`The uniform named "${key}" does not exist in shaders`);
            }
        }

        // Set attributes buffers
        for (const [key, value] of Object.entries(attributes)) {
            if (key in this.attributes) {
                this.attributes[key].buffer = WebglTools.getArrayBufferWithArray(gl, value);
            } else {
                console.warn(`The attributes named "${key}" does not exist in shaders`);
            }
        }
    }

    /**
     * Creates a WebGL program with the vertex and fragment shader.
     * @param {WebGLRenderingContext} gl The WebGL rendering context
     * @param {string} vertexSrc The source code of the vertex shader
     * @param {string} fragmentSrc The source code of the fragement shader
     * @returns {WebGLProgram} A WebGL program
     */
    #createProgram(gl, vertexSrc, fragmentSrc) {
        // Asserting that vertexShader and fragmentShader
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        this.#compileShader(gl, vertexShader, vertexSrc, "Vertex");

        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        this.#compileShader(gl, fragmentShader, fragmentSrc, "Fragment");

        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new ProgramError(
                "Failed to link shaders to program.",
                gl.getProgramInfoLog(program)
            );
        }

        return program;
    }

    /**
     * Compiles the shader or throws an exception if compilation did not pass.
     * @param {WebGLRenderingContext} gl The WebGL rendering context
     * @param {WebGLShader} shader The shader
     * @param {string} source The source code of the shader
     * @param {string} type The name of the shader (vertex or fragment)
     */
    #compileShader(gl, shader, source, type) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new ShaderError(
                `${type} shader failed to compile.`,
                gl.getShaderInfoLog(shader)
            );
        }
    }

    /**
     * Looks up the uniforms in the vertex & fragment shader and adds them in the unfiforms dictionary.
     * @param gl The WebGL rendering context
     * @param vertexSrc The vertex shader source code.
     * @param fragmentSrc The fragment shader source code.
     */
    #lookupUniforms(gl, vertexSrc, fragmentSrc) {
        let vertexUniforms = vertexSrc.match(this.#REGEX_UNIFORM);
        let fragmentUniforms = fragmentSrc.match(this.#REGEX_UNIFORM);

        if (vertexUniforms !== null) vertexUniforms.forEach(this.#addUniform, this);
        if (fragmentUniforms !== null)
            fragmentUniforms.forEach(this.#addUniform, this);

        Object.keys(this.uniforms).forEach((uniformName) => {
            this.uniforms[uniformName] = new Uniform(
                uniformName,
                gl.getUniformLocation(this.program, uniformName)
            );
        }, this);
    }

    /**
     * Looks up the attribute in the vertex shader and adds them in the attributes dictionary.
     * @param {WebGLRenderingContext} gl The WebGL rendering context
     * @param {string} vertexSrc The vertex shader source code
     */
    #lookupAttributes(gl, vertexSrc) {
        let vertexAttributes = vertexSrc.match(this.#REGEX_ATTRIBUTE);

        if (vertexAttributes !== null) {
            vertexAttributes.forEach(this.#addAttribute, this);
        } else {
            throw new Error("Regex result is null for attributes match.");
        }

        Object.keys(this.attributes).forEach((attributeName) => {
            let attribLocation = gl.getAttribLocation(this.program, attributeName);
            this.attributes[attributeName] = new Attribute(
                attributeName,
                attribLocation
            );
            gl.enableVertexAttribArray(attribLocation);
        }, this);
    }

    /**
     * Adds the uniform name and a default value in the uniforms dictionary.
     * @param {string} uniform The shader uniform
     */
    #addUniform(uniform) {
        let uniformName = uniform.match(this.#MATCH_UNIFORM_NAME);

        this.uniforms[uniformName[1]] = -1;
    }

    /**
     * Adds the attribute name and a default value in the attributes dictionary.
     * @param {string} attribute The shader attribute
     */
    #addAttribute(attribute) {
        let attributeName = attribute.match(this.#MATCH_ATTRIBUTE_NAME);

        this.attributes[attributeName[1]] = -1;
    }
}

class Uniform {
    /**
     *
     * @param {string} name
     * @param {WebGLUniformLocation} location
     * @param {any} value
     */
    constructor(name, location, value = null) {
        this.name = name;
        this.location = location;
        this.value = value;
    }
}

class Attribute {
    /**
     *
     * @param {string} name
     * @param {GLint} location
     * @param {WebGLBuffer | null} buffer
     */
    constructor(name, location, buffer = null) {
        this.name = name;
        this.location = location;
        this.buffer = buffer;
    }
}

class ShaderError extends Error {
    constructor(message, stack) {
        super(message);
        this.name = "Shader error";
        this.stack = stack;
    }
}

class ProgramError extends Error {
    constructor(message, stack) {
        super(message);
        this.name = "Program error";
        this.stack = stack;
    }
}

export {ShaderProgram};
