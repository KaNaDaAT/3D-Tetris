precision mediump float;

attribute vec4 a_position;
attribute vec4 a_color;
attribute vec3 a_normal;

uniform mat4 u_transform;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat3 u_normalMatrix;
uniform vec3 u_lightPosition;

varying vec4 v_vertexColor;
varying vec3 v_lightDirection;
varying vec3 v_normal;

void main() {
    vec4 position = u_view * u_transform * a_position;
    vec3 normal = normalize(u_normalMatrix * a_normal);
    v_normal = normal;

    v_lightDirection = normalize(u_lightPosition - position.xyz);

    v_vertexColor = a_color;

    gl_Position = u_projection * position;
}