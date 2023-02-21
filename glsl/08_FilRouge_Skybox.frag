#version 300 es

precision mediump float;

in vec4 vPosition;

uniform samplerCube uSkybox;
uniform mat4 uVPMatrixInverse;

out vec4 GLFragColor;

void main() {
    vec4 t = uVPMatrixInverse * vPosition;
    GLFragColor = texture(uSkybox, normalize(t.xyz / t.w));
}
