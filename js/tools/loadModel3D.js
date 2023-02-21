////////////////////////////////////////////////
////              Model Loader              ////
////////////////////////////////////////////////

import {Material, Object3D, Model} from "./object3D/object3D.js";
import WebglTools from "./webglTools.js";
import "../lib/gl-matrix.js";

// https://github.com/kovacsv/assimpjs - Copyright (c) 2021 Viktor Kovacs, MIT License
import assimpjs from "../lib/assimpjs.js";

async function assimpLoadModel(files) {
    let fileSource = files[0].substring(0, files[0].lastIndexOf('/'));
    let re = /(?:\.([^./]+))?$/;
    let fileExtension = re.exec(files[0])[1];

    let ajs = await assimpjs();
    let fileList = new ajs.FileList();
    for (const file of files) {
        fileList.AddFile(file, new Uint8Array(await (await fetch(file)).arrayBuffer()));
    }

    let result = ajs.ConvertFileList(fileList, 'assjson');

    // check if the conversion succeeded
    if (!result.IsSuccess() || result.FileCount() == 0) {
        console.error(result.GetErrorCode());
        return;
    }

    // get the result file, and convert to string
    let resultFile = result.GetFile(0);
    let jsonContent = new TextDecoder().decode(resultFile.GetContent());

    // parse the result json
    let objJSON = JSON.parse(jsonContent);
    console.log("JSON description of object : \n", files[0]);
    console.log(objJSON);

    // Create the model object. It will contain all the meshes.
    let model = new Model(files[0]);

    // LIST EMBED TEXTURES
    let texList = []
    if (objJSON.textures) {
        for (const tex of objJSON.textures) {
            let base64Tex = `data:image/${tex.formathint};base64,${tex.data}`
            let texBuffer = await WebglTools.initTextureWithImage(base64Tex);
            console.log(texBuffer);
            texList.push(texBuffer);
        }
    }

    // LIST ALL MATERIALS
    let matList = []
    for (const mat of objJSON.materials) {
        let properties = mat.properties;
        if (properties.find(p => p.key == "?mat.name") == null) continue;
        let newMat = new Material(properties.find(p => p.key == "?mat.name").value);

        // MATERIAL PROPERTIES
        newMat.diffuseColor = properties.find(p => p.key == "$clr.diffuse").value.slice(0, 3) ?? [1.0, 1.0, 1.0];

        // FIND TEXTURES
        let texMatList = properties.filter(p => p.key == "$tex.file");
        for (const tex of texMatList) {
            if ([1, 2, 5, 6].includes(tex.semantic) == false) continue;

            let texBuffer;
            if (texList.length > 0) texBuffer = texList[parseInt(tex.value.slice(1))];
            else texBuffer = await WebglTools.initTextureWithImage(fileSource + "/" + tex.value);

            // See TextureType in assimp -> https://pub.dev/documentation/assimp/latest/assimp/TextureType.html
            switch (tex.semantic) {
                case 1 : // Color map / diffuse
                    newMat.colorMap = texBuffer;
                    break;
                case 2: // Diffuse map
                    newMat.specularMap = texBuffer;
                    break;
                case 5: // Height map
                    newMat.heightMap = texBuffer;
                    if (fileExtension == "obj") newMat.normalMap = texBuffer; // OBJ files don't have a normal map attribute smh 😤
                    break;
                case 6: // Normal map
                    newMat.normalMap = texBuffer;
                    break;
            }
        }

        model.materials.push(newMat);
    }

    get3DObject(model, objJSON.rootnode, glMatrix.mat4.create());
    console.log("Object3D created from : \n", files[0]);
    console.log(model);
    return model;

    function get3DObject(model, currentNode, transformMatrix) {
        console.log(`Load ${currentNode.name} node`);

        let jsonTm = currentNode.transformation;
        let nodeTranformMatrix = glMatrix.mat4.fromValues(jsonTm[0], jsonTm[4], jsonTm[8], jsonTm[12], jsonTm[1], jsonTm[5], jsonTm[9], jsonTm[13], jsonTm[2], jsonTm[6], jsonTm[10], jsonTm[14], jsonTm[3], jsonTm[7], jsonTm[11], jsonTm[15]);

        // GET MESHES INFORMATIONS
        if (currentNode.meshes) {
            // let meshIndex = currentNode.meshes[0]; // WRONG : ASSIMP CAN HAVE MULTIPLE MESHES IN ONE NODE, IF THEY HAVE DIFFERENT MATERIALS

            for (const jsonMesh of currentNode.meshes) {

                let meshIndex = jsonMesh;
                let mesh = objJSON.meshes[meshIndex];

                let obj3D = new Object3D();
                obj3D.name = mesh.name;
                obj3D.parent = model;

                obj3D.indices = mesh.faces.flat();
                obj3D.indexBuffer = WebglTools.getIndexBufferWithIndices(mesh.faces.flat());
                obj3D.vertices = mesh.vertices;
                obj3D.vertexBuffer = WebglTools.getVertexBufferWithVertices(mesh.vertices);
                obj3D.normals = mesh.normals;
                obj3D.normalBuffer = WebglTools.getArrayBufferWithArray(mesh.normals);

                // Test if model has texture uv coord
                if (mesh.texturecoords) {
                    obj3D.uvCoords = mesh.texturecoords[0];
                    obj3D.uvCoordsBuffer = WebglTools.getArrayBufferWithArray(mesh.texturecoords[0]);
                    obj3D.tangents = WebglTools.calculateTangents(obj3D.vertices, obj3D.uvCoords, obj3D.indices);
                    obj3D.tangents = WebglTools.generateTangents(obj3D.vertices, obj3D.uvCoords, obj3D.indices);
                }

                // Test if model has vertex colors
                if (mesh.colors) {
                    obj3D.colors = mesh.colors[0];
                    obj3D.uvCoordsBuffer = WebglTools.getArrayBufferWithArray(mesh.colors[0]);
                } else obj3D.colors = new Array(mesh.vertices.length * 4).fill(1);

                obj3D.material = model.materials[mesh.materialindex];

                obj3D.modelMatrix = glMatrix.mat4.multiply(glMatrix.mat4.create(), transformMatrix, nodeTranformMatrix);

                model.children.push(obj3D);
            }
        }

        // IF HAS CHILDREN -> recursive
        if (currentNode.children) {
            for (const child of currentNode.children) {
                get3DObject(model,child,glMatrix.mat4.multiply(glMatrix.mat4.create(), transformMatrix, nodeTranformMatrix));
            }
        }
    }
}

/**
 * Creates an AJAX request to load a model asynchronously
 */
async function loadModel(files) {

    // assimpLoadObj(filename);
    return await assimpLoadModel(files);
}

export default loadModel;
