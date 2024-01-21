precision mediump float;

uniform vec3 u_lightColor;
uniform vec3 u_ambientColor;
uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;
uniform float u_specularIntensity;
uniform float u_shininess;

varying vec4 v_vertexColor;
varying vec3 v_lightDirection;
varying vec3 v_normal;
varying vec3 v_viewDirection;

void main() {
    // Compute the diffuse intensity
    float diffuseIntensity = max(dot(normalize(v_normal), normalize(v_lightDirection)), 0.0);

    // Compute the specular intensity
    vec3 reflectDirection = reflect(normalize(-v_lightDirection), normalize(v_normal));
    float specularIntensity = pow(max(dot(reflectDirection, normalize(v_viewDirection)), 0.0), u_shininess) * u_specularIntensity;

    // Compute the final color
    vec3 diffuseColor = u_diffuseColor * diffuseIntensity;
    vec3 specularColor = u_specularColor * specularIntensity * u_lightColor;
    vec3 ambientColor = u_ambientColor;
    vec3 finalColor = v_vertexColor.rgb * (diffuseColor + ambientColor) + specularColor;

    // Output the final color
    gl_FragColor = vec4(finalColor, v_vertexColor.a);
}