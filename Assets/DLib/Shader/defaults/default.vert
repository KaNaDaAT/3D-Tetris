attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_transform;
uniform mat4 u_projection;
uniform mat4 u_view;

varying vec4 v_vertexColor;

void main() {
    v_vertexColor = vec4(a_color.rgb, 1.0);
    gl_Position = u_projection * u_view * u_transform * a_position;
}
