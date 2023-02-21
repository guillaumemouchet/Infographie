#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec4 aVertexColor;
in vec3 aTangent;
in vec2 aTextureCoord;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

out vec4 vPosition;
out vec3 vNormal;
out vec3 vLightPos;
out vec3 vCamPos;
out vec2 vTextureCoord;
out vec4 vVertexColor;
out mat3 vTBN;

void main(void) {
    vTextureCoord = aTextureCoord;
    vVertexColor = aVertexColor;

    vec4 vertex = uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
    vPosition = vertex;
    vLightPos = (uVMatrix  * vec4(uLightPosition, 1.0)).xyz;
    vCamPos = (uVMatrix  * vec4(uCameraPosition, 1.0)).xyz;

    // TBN Matrix (Tangent, Bitangent, Normal Matrix)
    // Tranform from tangent space to world space
    // Usefull for normal mapping where the normal storred in the normal map is in tangent space
    // See : https://learnopengl.com/Advanced-Lighting/Normal-Mapping
    vec3 T = normalize(mat3(uNMatrix) * aTangent);
    vec3 N = normalize(mat3(uNMatrix) * aVertexNormal);
    vNormal = N;
    T = normalize(T - dot(T, N) * N);
    vec3 B = cross(N, T);
    vTBN = mat3(T, B, N);

    gl_Position = uPMatrix * vertex;
}
