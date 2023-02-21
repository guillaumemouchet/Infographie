/**
 * DemoObj3dModel.js - This class handles the whole scene. It contains the Initialization of the gl context, the objects displayed, handles the js interactions on the page and draws the scene
 */

import "./lib/gl-matrix.js";
import WebglTools from "./tools/webglTools.js";
import {ArcballCamera} from "./tools/arcballCamera.js";
import {Camera} from "./tools/camera.js";
import loadModel from "./tools/loadModel3D.js";
import "./lib/tweakpane.min.js";
import "./lib/tweakpane-plugin-infodump-0.2.0.js";

// WebGL lint is a script you can throw into
// your WebGL project to check for common WebGL errors.
// import "./lib/webgl-lint.js";

let glContext;
let basicMaterialShader;
let gui;
let camera;

/**************************************************\
 *                     SkyBox                      *
\**************************************************/
let skyboxShaderProgram;
let skyboxTexBuffer;
let skyboxVertexBuffer;
let skyboxVertexArrayObject;

// DEFAULT TEXTURE BUFFERS
let DEFAULT_COLOR_MAP;
let DEFAULT_SPEC_MAP;
let DEFAULT_NORMAL_MAP;

/**************************************************\
 *                   Global Params                 *
\**************************************************/
//App parameter dictionary
const PARAMS = {
    render: 0,
    showColorMap: true,
    showSpecMap: true,
    showNormalMap: true,
    position: {x: 0.0, y: 0.0, z: 0.0},
    rotation: {x: 0.0, y: 0.0, z: 0.0},
    scale: {x: 1.0, y: 1.0, z: 1.0},
    modelMatrix: "",
    specularIntensity: 1000.0, //change
    lightIntensity: 1.0,
    ambientColor: {r: 0.3, g: 0.3, b: 0.3},
    diffuseColor: {r: 1, g: 1, b: 1},
    specularColor: {r: 1, g: 1, b: 1},
    lightPosition: {x: 15.0, y: 25.0},
};

/**************************************************\
 *                      Table                      *
\**************************************************/
// Taille de référence pour tout les autres objets
const table_params = {
    position: {x: 0.0, y: 0.0, z: 0.0},
    rotation: {x: 0.0, y: 0.0, z: 0.0},
    scale: {x: 1.0, y: 1.0, z: 1.0}
};

/**************************************************\
 *                      Chairs                     *
\**************************************************/
// Chaise par rapport à la taille de référence
const chair_params_1 = {
    position: {x: 0.2, y: 0, z: 0.5}, // reculer la chaise de 1m
    rotation: {x: 0.0, y: 20, z: 0}, //
    scale: {x: 0.2,  y: 0.2, z: 0.2}, // scale la chaise à la bonne taille par rapport à la table
};

const chair_params_2 = {
    position: {x: 0.2, y: 0, z: -0.9}, // reculer la chaise de 1m
    rotation: {x: 0.0, y: 220, z: 0.0}, 
    scale: {x: 0.2,  y: 0.2, z: 0.2}, // scale la chaise à la bonne taille par rapport à la table
};

const chair_params_3 = {
    position: {x: -0.5, y: 0, z: 0.5}, // reculer la chaise de 1m
    rotation: {x: 0.0, y: -10, z: 0}, //
    scale: {x: 0.2,  y: 0.2, z: 0.2},
    };

/**************************************************\
 *                      PDice                      *
\**************************************************/
const dice_params_1 = {
        position: {x: -0.2, y: 0.74, z: -0.35}, //
        rotation: {x: 85, y: 0, z: 0}, //
        scale: {x: 0.00001,  y: 0.00001, z: 0.00001},
        };
        
const dice_params_2 = {
        position: {x: 0.14, y: 0.74, z: 0.23}, //
        rotation: {x: 40, y: 0, z: 180}, //
        scale: {x: 0.00001,  y: 0.00001, z: 0.00001},
        };
const dice_params_3 = {
    position: {x: -0.05, y: 0.74, z: 0.34}, //
    rotation: {x: 40, y: 0, z: 180}, //
    scale: {x: 0.00001,  y: 0.00001, z: 0.00001},
    };

/**************************************************\
 *                       Deck                      *
\**************************************************/

const deck_params_1 = {
    position: {x: -0.21, y: 0.74, z: -0.27}, //
    rotation: {x: 0, y: 178, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

const deck_params_2 = {
    position: {x: 0.2, y: 0.74, z: 0.25}, //
    rotation: {x: 0, y: 6, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };


/**************************************************\
 *                   Chandra                      *
\**************************************************/

const chandra_params_1 = {
    position: {x: -0.1, y: 0.73, z: 0.34}, //
    rotation: {x: 0, y: -2, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

const chandra_params_2 = {
    position: {x: -0.21, y: 0.73, z: 0.3}, //
    rotation: {x: 0, y: -1, z: 180}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

const chandra_params_3 = {
    position: {x: 0.04, y: 0.73, z: -0.32}, //
    rotation: {x: 180, y: 3, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

const chandra_params_4 = {
    position: {x: 0.15, y: 0.73, z: -0.28}, //
    rotation: {x: 180, y: 2, z: 180}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };


/**************************************************\
 *                   Hand                      *
\**************************************************/

const hand_params_1 = {
    position: {x: 0, y: 0.8, z: -0.56}, //
    rotation: {x: -95, y: 15, z: 180}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

const hand_params_2 = {
    position: {x: 0, y: 0.8, z: 0.54}, //
    rotation: {x: 87, y: 10, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

/**************************************************\
 *                   Forest                        *
\**************************************************/

const forest_params_1 = {
    position: {x: 0, y: 0.731, z: 0.44}, //
    rotation: {x: 0, y: -90, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

const forest_params_2 = {
    position: {x: 0.04, y: 0.7302, z: 0.44}, //
    rotation: {x: 0, y: 8, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };
const forest_params_3 = {
    position: {x: 0.08, y: 0.7304, z: 0.44}, //
    rotation: {x: 0, y: 0, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

const forest_params_4 = {
    position: {x: 0, y: 0.73, z: -0.43}, //
    rotation: {x: 0, y: 180, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

const forest_params_5 = {
    position: {x: 0.04, y: 0.7302, z: -0.43}, //
    rotation: {x: 0, y: 184, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };
const forest_params_6 = {
    position: {x: 0.08, y: 0.7306, z: -0.432}, //
    rotation: {x: 0, y: 90, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

const forest_params_7 = {
    position: {x: 0.21, y: 0.73, z: 0.35}, //
    rotation: {x: 0, y: 0, z: 0}, //
    scale: {x: 0.02,  y: 0.02, z: 0.02},
    };

/**************************************************\
 *                   Floor                        *
\**************************************************/

const floor_params = {
    position: {x: 0, y: -8.05, z: 0}, //
    rotation: {x: 0, y: 0, z: 0}, //
    scale: {x: 0.4,  y: 0.4, z: 0.4},
    };

/**************************************************\
 *               Variables globales               *
\**************************************************/ 

let CHAIR_MODEL;
let TABLE_MODEL;
let DICE_MODEL;
let DICE_ROTATION_MODEL;
let FOREST_MODEL;
let CHANDRA_MODEL;
let DECK_MODEL;
let HAND_MODEL;
let FLOOR_MODEL;

const MODELS = {

    // Meublier
    CHAIR: {files: ["../model/chair/chair.obj", "../model/chair/chair.mtl"]},
    TABLE: {files: ["../model/table/table.obj", "../model/table/table.mtl"]},
    
    // Cartes
    FOREST: {files: ["../model/cartes/forest.obj", "../model/cartes/forest.mtl"]},
    CHANDRA: {files: ["../model/cartes/chandra_default.obj", "../model/cartes/chandra_default.mtl"]},
    DECK: {files: ["../model/cartes/deck.obj", "../model/cartes/deck.mtl"]},
    HAND: {files: ["../model/cartes/hand.obj", "../model/cartes/hand.mtl"]},


    D20: {files: ["../model/d20/Dice20.fbx"]},
    FLOOR: {files: ["../model/floor/floor.obj", "../model/floor/floor.mtl"]},
};

//Initialization of the UI Components (buttons, sliders, etc.)
function initUiComponents() {
    gui = new Tweakpane.Pane({
        title: "Parameters",
        container: document.getElementById("gui"),
    });

    gui.registerPlugin(TweakpaneInfodumpPlugin);

    const tab = gui.addTab({
        pages: [
            {title: '3D Object'},
            {title: 'Lighting'},
        ],
    });

    // 3D Object TAB
    // =================================================

    // Render mode list
    tab.pages[0].addInput(PARAMS, "render", {
        label: "Render",
        options: {
            filled: 0,
            wireframe: 1,
        },
    });

    tab.pages[0].addInput(PARAMS, "showColorMap", {
        label: "Color map"
    });

    tab.pages[0].addInput(PARAMS, "showSpecMap", {
        label: "Specular map"
    });

    tab.pages[0].addInput(PARAMS, "showNormalMap", {
        label: "Normal map"
    });

    // OBJECT TRANSFORM FOLDER
    // =================================================

    const transformFolder = tab.pages[0].addFolder({
        title: 'Object transform',
    });

    transformFolder.addInput(PARAMS, "position", {
        label: "Position",
        x: {step: 0.01, min: -25, max: 25},
        y: {step: 0.01, min: -25, max: 25},
    });

    transformFolder.addInput(PARAMS, "rotation", {
        label: "Rotation",
        x: {step: 1, min: -360, max: 360},
        y: {step: 1, min: -360, max: 360},
    });

    transformFolder.addInput(PARAMS, "scale", {
        label: "Scale",
        x: {step: 0.01, min: -25, max: 25},
        y: {step: 0.01, min: -25, max: 25},
    });

    transformFolder.addMonitor(PARAMS, 'modelMatrix', {
        label: "Model Matrix",
        multiline: true,
        lineCount: 5,
    });

    // CAMERA TRANSFORM FOLDER
    // =================================================

    Camera.appendCameraInfoToTweakpaneGUI(gui, tab.pages[0],camera)

    // LIGHTING TAB
    // =================================================

    tab.pages[1].addInput(PARAMS, "lightPosition", {
        label: "Light position (x,y,5.0)",
        picker: "inline",
        expanded: true,
        x: {step: 0.01, min: -25, max: 25},
        y: {step: 0.01, min: -25, max: 25, inverted: true},
    });

    tab.pages[1].addInput(PARAMS, 'ambientColor', {
        label: "Ambient color",
        color: {type: 'float'},
    });

    tab.pages[1].addInput(PARAMS, 'diffuseColor', {
        label: "Diffuse color",
        color: {type: 'float'},
    });

    tab.pages[1].addInput(PARAMS, 'specularColor', {
        label: "Specular color",
        color: {type: 'float'},
    });

    tab.pages[1].addInput(PARAMS, 'specularIntensity', {
        label: "Specular intensity",
        step: 0.1,
        min: 0,
        max: 1000,
    });
}

//Initialization of the scene
async function initScene() {
    await initBuffers();

    //SELECTED_MODEL = await loadModel(MODELS.SURFACE.files);
    CHAIR_MODEL = await loadModel(MODELS.CHAIR.files);
    TABLE_MODEL = await loadModel(MODELS.TABLE.files);
    DICE_MODEL = await loadModel(MODELS.D20.files);
    DICE_ROTATION_MODEL = await loadModel(MODELS.D20.files);

    FOREST_MODEL = await loadModel(MODELS.FOREST.files);
    HAND_MODEL = await loadModel(MODELS.HAND.files);
    CHANDRA_MODEL = await loadModel(MODELS.CHANDRA.files);
    DECK_MODEL = await loadModel(MODELS.DECK.files);
    FLOOR_MODEL = await loadModel(MODELS.FLOOR.files);

    //Set the skybox
    // Create a vertex array object (attribute state)
    skyboxVertexArrayObject = glContext.createVertexArray();

    // and make it the one we're currently working with
    glContext.bindVertexArray(skyboxVertexArrayObject);
    let skyboxVertexPositions = new Float32Array(
        [
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]);
        
    skyboxVertexBuffer = WebglTools.getVertexBufferWithVertices(skyboxVertexPositions);
    glContext.enableVertexAttribArray(skyboxShaderProgram.attributes.aVertexPosition.location);

    //Defining the viewport as the size of the canvas
    glContext.viewport(
        0.0,
        0.0,
        WebglTools.canvasWidth,
        WebglTools.canvasHeight
    );

    //Enabling the depth test
    glContext.enable(glContext.DEPTH_TEST);
    //Sets the color black for the clear of the scene
    glContext.clearColor(0.0, 0.0, 0.0, 1.0);

    camera.setPerspective(
        WebglTools.degToRad(40),
        WebglTools.canvasWidth / WebglTools.canvasHeight,
        0.1,
        1000.0
    );

    //Starting the render loop
    renderLoop(0.0);
}

async function initBuffers() {
    // Empty default texture buffers of 1 by 1 pixel
    DEFAULT_COLOR_MAP = WebglTools.init1by1Texture([255,255,255,255]);
    DEFAULT_SPEC_MAP = WebglTools.init1by1Texture([0,0,0,255]);
    DEFAULT_NORMAL_MAP = WebglTools.init1by1Texture([127,127,255,0]); // => N(0,0,1)

    let skyPath = "../img/skyboxes/skybox10/";
    skyboxTexBuffer = await WebglTools.loadCubemap(
        skyPath + "rightImage.png",
        skyPath + "leftImage.png",
        skyPath + "upImage.png",
        skyPath + "downImage.png",
        skyPath + "backImage.png",
        skyPath + "frontImage.png");
}

function renderLoop(now) {
    requestAnimationFrame(renderLoop);
    drawScene(now);
}

//Draw scene method called when the render loop is started
function drawScene(now) {
    //Clearing the previous render based on color and depth
    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);

    //Handling the mouse rotation on the scene
    camera.update(now);

    glContext.useProgram(skyboxShaderProgram.program);
    drawSkybox();

    glContext.useProgram(basicMaterialShader.program);
    
    for (const child of CHAIR_MODEL.children) {
        drawModel(child, chair_params_1);
        drawModel(child, chair_params_2);
        drawModel(child, chair_params_3);
    }
    
    for (const child of TABLE_MODEL.children) {
        drawModel(child, table_params);
    }

    for (const child of DICE_MODEL.children) { 
        drawModel(child, dice_params_1);
        drawModel(child, dice_params_2);

    }
    for (const child of DICE_ROTATION_MODEL.children) { 
        drawModel(child, dice_params_3);

    }

    for (const child of DECK_MODEL.children) {
        drawModel(child, deck_params_1);
        drawModel(child, deck_params_2);
    }

    for (const child of HAND_MODEL.children) {
        drawModel(child, hand_params_1);
        drawModel(child, hand_params_2);
    }

    for (const child of FOREST_MODEL.children) {
        drawModel(child, forest_params_1);
        drawModel(child, forest_params_2);
        drawModel(child, forest_params_3);
        drawModel(child, forest_params_4);
        drawModel(child, forest_params_5);
        drawModel(child, forest_params_6);
        drawModel(child, forest_params_7);

    }

    for (const child of CHANDRA_MODEL.children) {
        drawModel(child, chandra_params_1);
        drawModel(child, chandra_params_2);
        drawModel(child, chandra_params_3);
        drawModel(child, chandra_params_4);
    }

    for (const child of FLOOR_MODEL.children) {
        drawModel(child, floor_params);
    }


    //Animation, rotation 
    glMatrix.quat.rotateY(DICE_ROTATION_MODEL.rotation,DICE_ROTATION_MODEL.rotation,Math.PI/100);
    glMatrix.quat.rotateZ(DICE_ROTATION_MODEL.rotation,DICE_ROTATION_MODEL.rotation,Math.PI/150);
    glMatrix.quat.rotateX(DICE_ROTATION_MODEL.rotation,DICE_ROTATION_MODEL.rotation,Math.PI/170);
    DICE_ROTATION_MODEL.updateModelMatrix();
    // Refresh the gui in order to update the displayed values of the camera
    gui.refresh();
}


/**
 * @param {Model} model
 */
function drawModel(model, parameters) // Tableau de paramètres
{

    // IF THE MODEL HAS A MESH (hence indices), DRAW IT
    if (model.indices){
        // OVERRIDE MODEL MATRIX
        let newMMatrix = glMatrix.mat4.create();
        let newPosition = glMatrix.vec3.fromValues(parameters.position.x, parameters.position.y, parameters.position.z); /// TODO
        let newScale = glMatrix.vec3.fromValues(parameters.scale.x,parameters.scale.y, parameters.scale.z); //TODO
        let newRotation = glMatrix.quat.fromEuler(glMatrix.quat.create(), parameters.rotation.x, parameters.rotation.y, parameters.rotation.z); //TODO
        glMatrix.mat4.fromRotationTranslationScale(newMMatrix, newRotation, newPosition, newScale);
        glMatrix.mat4.multiply(newMMatrix, newMMatrix, model.modelMatrix);
        // To display the override matrix in the GUI
        PARAMS.modelMatrix = `${newMMatrix[0].toFixed(2)}, ${newMMatrix[4].toFixed(2)}, ${newMMatrix[8].toFixed(2)}, ${newMMatrix[12].toFixed(2)}\n` +
            `${newMMatrix[1].toFixed(2)}, ${newMMatrix[5].toFixed(2)}, ${newMMatrix[9].toFixed(2)}, ${newMMatrix[13].toFixed(2)}\n`+
            `${newMMatrix[2].toFixed(2)}, ${newMMatrix[6].toFixed(2)}, ${newMMatrix[10].toFixed(2)}, ${newMMatrix[14].toFixed(2)}\n`+
            `${newMMatrix[3].toFixed(2)}, ${newMMatrix[7].toFixed(2)}, ${newMMatrix[11].toFixed(2)}, ${newMMatrix[15].toFixed(2)}`;

        //Sending the current model Matrix to the shader
        glContext.uniformMatrix4fv(
            basicMaterialShader.uniforms.uMMatrix.location,
            false,
            newMMatrix
        );

        //Sending the current view Matrix to the shader
        glContext.uniformMatrix4fv(
            basicMaterialShader.uniforms.uVMatrix.location,
            false,
            camera.viewMatrix
        );

        //Sending the  projection matrix to the shader
        glContext.uniformMatrix4fv(
            basicMaterialShader.uniforms.uPMatrix.location,
            false,
            camera.projectionMatrix
        );

        //Sending the normal matrix to the shader
        let nMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(nMatrix, camera.viewMatrix, model.modelMatrix);
        glMatrix.mat4.invert(nMatrix, nMatrix);
        glMatrix.mat4.transpose(nMatrix, nMatrix); //We calculate the transposed matrix
        glContext.uniformMatrix4fv(
            basicMaterialShader.uniforms.uNMatrix.location,
            false,
            nMatrix
        );

        // LIGHTING UNIFORMS BINDINGS
        glContext.uniform3fv(
            basicMaterialShader.uniforms.uCameraPosition.location, camera.position
        );
        glContext.uniform3f(
            basicMaterialShader.uniforms.uAmbientColor.location,
            PARAMS.ambientColor.r,
            PARAMS.ambientColor.g,
            PARAMS.ambientColor.b
        );
        glContext.uniform3f(
            basicMaterialShader.uniforms.uDiffuseColor.location,
            PARAMS.diffuseColor.r,
            PARAMS.diffuseColor.g,
            PARAMS.diffuseColor.b
        );
        glContext.uniform3f(
            basicMaterialShader.uniforms.uSpecularColor.location,
            PARAMS.specularColor.r,
            PARAMS.specularColor.g,
            PARAMS.specularColor.b
        );
        glContext.uniform1f(
            basicMaterialShader.uniforms.uSpecularIntensity.location,
            PARAMS.specularIntensity
        );
        glContext.uniform3f(
            basicMaterialShader.uniforms.uLightPosition.location,
            PARAMS.lightPosition.x,
            PARAMS.lightPosition.y,
            25.0
        );

        // If the model has a material associated
        if (model.material) {
            glContext.uniform3fv(basicMaterialShader.uniforms.uMatDiffuseColor.location,model.material.diffuseColor);

            // Set color texture to index = 0
            glContext.activeTexture(glContext.TEXTURE0);
            // Bind and send the color texture buffer as uniform
            glContext.bindTexture(glContext.TEXTURE_2D, PARAMS.showColorMap ? model.material.colorMap : DEFAULT_COLOR_MAP);
            glContext.uniform1i(basicMaterialShader.uniforms.uColorTexture.location, 0); // value uniform = 0 because we bind TEXTURE0

            // Set specular texture to index = 1
            glContext.activeTexture(glContext.TEXTURE1);
            // Bind and send the color texture buffer as uniform
            glContext.bindTexture(glContext.TEXTURE_2D, PARAMS.showSpecMap ? model.material.specularMap : DEFAULT_SPEC_MAP);
            glContext.uniform1i(basicMaterialShader.uniforms.uSpecularTexture.location, 1); // value uniform = 0 because we bind TEXTURE0

            // Set normal texture to index = 2
            glContext.activeTexture(glContext.TEXTURE2);
            // Bind and send the color texture buffer as uniform
            glContext.bindTexture(glContext.TEXTURE_2D, PARAMS.showNormalMap ? model.material.normalMap : DEFAULT_NORMAL_MAP);
            glContext.uniform1i(basicMaterialShader.uniforms.uNormalTexture.location, 2); // value uniform = 0 because we bind TEXTURE0

        }

        // BINDING ATTRIBUTES
        // Bind and send the vertex buffer
        glContext.bindBuffer(glContext.ARRAY_BUFFER, model.vertexBuffer);
        glContext.vertexAttribPointer(basicMaterialShader.attributes.aVertexPosition.location, 3, glContext.FLOAT, false, 0, 0);

        // Bind and send the normal buffer
        glContext.bindBuffer(glContext.ARRAY_BUFFER, model.normalBuffer);
        glContext.vertexAttribPointer(basicMaterialShader.attributes.aVertexNormal.location, 3, glContext.FLOAT, false, 0, 0);

        // Bind and send the tangent buffer
        glContext.bindBuffer(glContext.ARRAY_BUFFER, model.tangentBuffer);
        glContext.vertexAttribPointer(basicMaterialShader.attributes.aTangent.location, 3, glContext.FLOAT, false, 0, 0);

        // Bind and send the normal buffer
        glContext.bindBuffer(glContext.ARRAY_BUFFER, model.colorBuffer);
        glContext.vertexAttribPointer(basicMaterialShader.attributes.aVertexColor.location, 4, glContext.FLOAT, false, 0, 0);

        // Bind and send the uv buffer (contains the texture coordinates for the model)
        glContext.bindBuffer(glContext.ARRAY_BUFFER, model.uvCoordsBuffer);
        glContext.vertexAttribPointer(basicMaterialShader.attributes.aTextureCoord.location, 2, glContext.FLOAT, false, 0, 0);

        // Bind and send the index buffer
        glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, model.indexBuffer);

        //Based on the render variable
        switch (PARAMS.render) {
            default:
                //Renders the objet as a wireframe
                glContext.drawElements(
                    glContext.TRIANGLES,
                    model.indices.length,
                    glContext.UNSIGNED_SHORT,
                    0
                );
                break;
            case 1:
                //Renders the object as triangles
                glContext.drawElements(
                    glContext.LINES,
                    model.indices.length,
                    glContext.UNSIGNED_SHORT,
                    0
                );
                break;
        }
    }
}

function drawSkybox() {
    // Bind the attribute/buffer set we want.
    glContext.bindVertexArray(skyboxVertexArrayObject);

    let vpMatrixInverse = glMatrix.mat4.create();
    glMatrix.mat4.copy(vpMatrixInverse, camera.viewMatrix);
    vpMatrixInverse[12] = 0;
    vpMatrixInverse[13] = 0;
    vpMatrixInverse[14] = 0;
    glMatrix.mat4.multiply(vpMatrixInverse, camera.projectionMatrix, vpMatrixInverse);
    glMatrix.mat4.invert(vpMatrixInverse, vpMatrixInverse);

    glContext.uniformMatrix4fv(skyboxShaderProgram.uniforms.uVPMatrixInverse.location, false, vpMatrixInverse);

    //We activate the TEXTURE0 slot
    glContext.activeTexture(glContext.TEXTURE0);
    //We indicate that it is a TEXTURE_CUBE_MAP and give it the first skybox
    glContext.bindTexture(glContext.TEXTURE_CUBE_MAP, skyboxTexBuffer);
    glContext.uniform1i(skyboxShaderProgram.uniforms.uSkybox.location, 0);

    glContext.bindBuffer(glContext.ARRAY_BUFFER, skyboxVertexBuffer);
    glContext.vertexAttribPointer(
        skyboxShaderProgram.attributes.aVertexPosition.location,
        2,
        glContext.FLOAT,
        false,
        0,
        0
    );
    glContext.depthFunc(glContext.LEQUAL);
    glContext.drawArrays(glContext.TRIANGLES, 0, 6);
    glContext.bindVertexArray(null);
}

//Initialization of the webgl context
async function initWebGL() {
    //Initialization on the canvas "webgl-canvas"
    glContext = WebglTools.getGLContext("webgl-canvas");

    //Initialization of the camera
    camera = new ArcballCamera(
        5.0,
        [0.0, 0.0, 0.0],
        0.0,
        [WebglTools.canvasWidth, WebglTools.canvasHeight],
        0.1,
        1000.0
    );
    camera.bindCanvas(document.getElementById("webgl-canvas"));

    skyboxShaderProgram = await WebglTools.initProgramFromFiles(
        ["../glsl/08_FilRouge_Skybox.vert"],
        ["../glsl/08_FilRouge_Skybox.frag"]
    );
    //Initialization of the programd
    basicMaterialShader = await WebglTools.initProgramFromFiles(["../glsl/BasicMaterialShader.vert"],
        ["../glsl/BasicMaterialShader.frag"])

    
    //Initialization of the UI components (buttons, sliders, checkboxes,etc.)
    initUiComponents();

    //Initialization of the scene
    await initScene();
}

await initWebGL();