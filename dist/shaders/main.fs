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

struct DirLight {
    lowp vec3 direction;
  
    lowp vec3 ambient;
    lowp vec3 diffuse;
    lowp vec3 specular;
};  
uniform DirLight uDirLight;

struct PointLight {    
    lowp vec3 position;
    
    lowp float constant;
    lowp float linear;
    lowp float quadratic;  

    lowp vec3 ambient;
    lowp vec3 diffuse;
    lowp vec3 specular;
};
uniform lowp int vNumPointLights;
#define NR_POINT_LIGHTS 100
uniform PointLight uPointLights[NR_POINT_LIGHTS];

highp vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir)
{
    highp vec3 lightDir = normalize(light.direction);
    // diffuse shading
    highp float diff = max(dot(normal, lightDir), 0.0);
    // specular shading
    highp vec3 reflectDir = reflect(-lightDir, normal);
    highp float spec = pow(max(dot(viewDir, reflectDir), 0.0), uMaterial.shininess);
    // combine results
    highp vec3 ambient  = light.ambient  * vec3(texture2D(uMaterial.diffuse, vTextureCoord));
    highp vec3 diffuse  = light.diffuse  * diff * vec3(texture2D(uMaterial.diffuse, vTextureCoord));
    highp vec3 specular = light.specular * spec * vec3(texture2D(uMaterial.specular, vTextureCoord));
    return (ambient + diffuse + specular);
}

highp vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    highp vec3 lightDir = normalize(light.position - fragPos);
    // diffuse shading
    highp float diff = max(dot(normal, lightDir), 0.0);
    // specular shading
    highp vec3 reflectDir = reflect(-lightDir, normal);
    highp float spec = pow(max(dot(viewDir, reflectDir), 0.0), uMaterial.shininess);
    // attenuation
    highp float distance    = length(light.position - fragPos);
    highp float attenuation = 1.0 / (light.constant + light.linear * distance + 
  			     light.quadratic * (distance * distance));    
    // combine results
    highp vec3 ambient  = light.ambient  * vec3(texture2D(uMaterial.diffuse, vTextureCoord));
    highp vec3 diffuse  = light.diffuse  * diff * vec3(texture2D(uMaterial.diffuse, vTextureCoord));
    highp vec3 specular = light.specular * spec * vec3(texture2D(uMaterial.specular, vTextureCoord));
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
} 

void main(void) {

    highp vec3 viewDir = normalize(vViewPos - vFragPos);
    highp vec3 lightColor = vec3(1.0,1.0,0.94);

    // Directional lighting
    highp vec3 result = CalcDirLight(uDirLight, vNormal, viewDir);

    // Point lights
    for(int i = 0; i < NR_POINT_LIGHTS; i++) {
        if (i >= vNumPointLights){break;}
        result += CalcPointLight(uPointLights[i], vNormal, vFragPos, viewDir); 
    }

    gl_FragColor = vec4(result, 1.0);
    
}