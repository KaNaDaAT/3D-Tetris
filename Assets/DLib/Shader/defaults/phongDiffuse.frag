precision mediump float;

uniform vec3 u_ambientColor;
uniform vec3 u_diffuseColor;

varying vec4 v_vertexColor;
varying vec3 v_normal;
varying vec3 v_lightDirection;

void main() {
    float diffuseIntensity = max(dot(normalize(v_normal), normalize(v_lightDirection)), 0.0);

    // Compute the final color
    vec3 diffuseColor = u_diffuseColor * diffuseIntensity;
    vec3 ambientColor = u_ambientColor;
    vec3 finalColor = v_vertexColor.rgb * (diffuseColor + ambientColor);

    // Output the final color
    gl_FragColor = vec4(finalColor, v_vertexColor.a);
}