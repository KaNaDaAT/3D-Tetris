precision mediump float;


attribute vec4 a_position;
attribute vec4 a_color;
attribute vec3 a_normal;

uniform mat4 u_transform;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat3 u_normalMatrix;
uniform vec3 u_lightColor;
uniform vec3 u_lightPosition;
uniform vec3 u_ambientColor;
uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;
uniform float u_specularIntensity;
uniform float u_shininess;

varying vec4 v_vertexColor;

void main() {
    // Transform the vertex position and normal to view space
    vec4 position = u_view * u_transform * a_position;
    vec3 normal = normalize(u_normalMatrix * a_normal);

    // Compute the diffuse intensity
    vec3 lightDirection = normalize(u_lightPosition - position.xyz);
    float diffuseIntensity = max(dot(normal, lightDirection), 0.0);

    // Compute the specular intensity
    vec3 viewDirection = normalize(-position.xyz);
    vec3 reflectDirection = reflect(-lightDirection, normal);
    float specularIntensity = pow(max(dot(reflectDirection, viewDirection), 0.0), u_shininess) * u_specularIntensity;

    // Compute the final color
    vec3 diffuseColor = u_diffuseColor * diffuseIntensity;
    vec3 specularColor = u_specularColor * specularIntensity * u_lightColor;
    vec3 ambientColor = u_ambientColor;
    vec3 finalColor = a_color.rgb * (diffuseColor + ambientColor) + specularColor;

    // Pass the vertex color to the fragment shader
    v_vertexColor = vec4(finalColor, 1);

    // Transform the vertex position to clip space
    gl_Position = u_projection * position;
}
