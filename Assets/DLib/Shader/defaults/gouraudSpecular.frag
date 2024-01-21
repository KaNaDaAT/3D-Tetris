precision mediump float;

// Fragment Shader

varying vec4 v_vertexColor;

void main() {
  gl_FragColor = v_vertexColor;
}