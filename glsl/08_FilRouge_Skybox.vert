#version 300 es

in vec4 aVertexPosition;

out vec4 vPosition;

void main() {
    vPosition = aVertexPosition;
    gl_Position = aVertexPosition;
    gl_Position.z = 1.0;
}
