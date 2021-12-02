varying highp vec3 vFragPos;
varying highp vec3 vNormal;
varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;
varying lowp vec3 vViewPos;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    lowp float shininess;
}; 
  
uniform Material uMaterial;

void main(void) {

    highp vec3 lightColor = vec3(1.0,1.0,0.94);
    // Ambient
    highp vec3 ambient = lightColor * 0.1 * vec3(texture2D(uMaterial.diffuse, vTextureCoord));

    // Diffuse
    highp vec3 lightDir = normalize(vec3(1.0,1.0,0.0));
    highp float diff = max(dot(vNormal, lightDir), 0.0);
    highp vec3 diffuse = lightColor * (diff * vec3(texture2D(uMaterial.diffuse, vTextureCoord)));

    // Specular
    highp vec3 viewDir = normalize(vViewPos - vFragPos);
    highp vec3 reflectDir = reflect(-lightDir, vNormal);  
    highp float spec = pow(max(dot(viewDir, reflectDir), 0.0), uMaterial.shininess);
    highp vec3 specular = lightColor * 1. * (spec * vec3(texture2D(uMaterial.specular, vTextureCoord)));  

    highp vec3 result = (ambient + diffuse + specular) * vec3(vColor);
    gl_FragColor = vec4(result, 1.0);
    
}