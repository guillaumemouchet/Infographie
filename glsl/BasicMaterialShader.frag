#version 300 es

precision highp float;

in vec4 vPosition;
in vec3 vLightPos;
in vec3 vCamPos;
in vec3 vNormal;
in vec2 vTextureCoord;
in vec4 vVertexColor;
in mat3 vTBN;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform sampler2D uColorTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uSpecularTexture;

uniform vec3 uMatDiffuseColor;

uniform vec3 uCameraPosition;
uniform vec3 uLightPosition;
uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;
uniform float uSpecularIntensity;

out vec4 GLFragColor;

void main(void){

    vec2 mapCoord = vec2(vTextureCoord.s, vTextureCoord.t);

    // ambient
    vec3 ambient = uAmbientColor * texture(uColorTexture, mapCoord).rgb * uMatDiffuseColor * vVertexColor.rgb;

    // diffuse
    vec3 normalVector = 2.0 * texture(uNormalTexture, mapCoord).rgb - 1.0;
    normalVector = vTBN * normalVector;
    vec3 N = normalize(normalVector);
    vec3 L = normalize(vLightPos - vPosition.xyz);
    float lambertTerm = max(dot(N, L), 0.0);
    vec3 diffuse = uDiffuseColor * lambertTerm * texture(uColorTexture, mapCoord).rgb * uMatDiffuseColor * vVertexColor.rgb;

    // specular
    vec3 viewDir = normalize(vCamPos - vPosition.xyz);
    vec3 reflectDir = reflect(-L, N);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uSpecularIntensity);
    vec3 specular = uSpecularColor * spec * texture(uSpecularTexture, mapCoord).rgb;

    GLFragColor = vec4(ambient + diffuse + specular, 1.0);
}


