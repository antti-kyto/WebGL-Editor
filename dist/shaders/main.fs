varying highp vec3 vFragPos;
varying highp vec3 vNormal;
varying highp vec3 vTangent;
varying highp vec3 vBitangent;
varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;
varying lowp vec3 vViewPos;
varying highp vec4 vFragPosLightSpace;

uniform sampler2D uShadowMap;

struct Material {
    sampler2D diffuse;
    sampler2D normal;
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

highp float ShadowCalculation(highp vec4 fragPosLightSpace, DirLight light, highp vec3 normal)
{
    // perform perspective divide
    highp vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    
    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;
    if(projCoords.x>1. || projCoords.x<.0 || projCoords.y>1. || projCoords.y<.0){
        return .0;
    }
    
    
    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    highp float closestDepth = texture2D(uShadowMap, projCoords.xy).r; 
    
    // get depth of current fragment from light's perspective
    highp float currentDepth = projCoords.z;

    // check whether current frag pos is in shadow
    highp float bias = max(0.05 * (1.0 - dot(normal, light.direction)), 0.005);  
    highp float shadow = currentDepth - bias > closestDepth  ? 1.0 : 0.0;  

    return shadow;
} 

highp vec3 CalcDirLight(DirLight light, highp vec3 normal, highp vec3 viewDir)
{
    highp vec3 lightDir = normalize(light.direction);
    // diffuse shading
    highp float diff = max(dot(normal, lightDir), 0.0);
    // specular shading
    highp vec3 halfwayDir = normalize(lightDir + viewDir);
    highp float spec = pow(max(dot(normal, halfwayDir), 0.0), uMaterial.shininess);
    if(diff == 0.0)
        spec = 0.0;

    highp float shadow = ShadowCalculation(vFragPosLightSpace, light, normal); 
    // combine results
    highp vec3 ambient  = light.ambient  * vec3(texture2D(uMaterial.diffuse, vTextureCoord));
    highp vec3 diffuse  = light.diffuse  * diff * vec3(texture2D(uMaterial.diffuse, vTextureCoord));
    highp vec3 specular = light.specular * spec * vec3(texture2D(uMaterial.specular, vTextureCoord));
    return (ambient + (1.0 - shadow) * (diffuse + specular));
}

highp vec3 CalcPointLight(PointLight light, highp vec3 normal, highp vec3 fragPos, highp vec3 viewDir)
{
    highp vec3 lightDir = normalize(light.position - fragPos);
    // diffuse shading
    highp float diff = max(dot(normal, lightDir), 0.0);
    // specular shading
    highp vec3 halfwayDir = normalize(lightDir + viewDir);
    highp float spec = pow(max(dot(normal, halfwayDir), 0.0), uMaterial.shininess);
    if(diff == 0.0)
        spec = 0.0;
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

// void main(void) {
//     highp float shadow = ShadowCalculation(vFragPosLightSpace); 
//     highp vec3 lighting = (vec3(0,0,0) + (1.0 - shadow)) * vec3(0.3, 0.3, 0.3);   
//     gl_FragColor = vec4(lighting, 1.0);
// }

void main(void) {

    highp mat3 TBN = mat3(vTangent, vBitangent, vNormal);
    highp vec3 normal = vec3(texture2D(uMaterial.normal, vTextureCoord));
    normal = normal * 2.0 - 1.0;   
    normal = normalize(TBN * normal);

    highp vec3 viewDir = normalize(vViewPos - vFragPos);
    highp vec3 lightColor = vec3(1.0,1.0,0.94);

    // Directional lighting
    highp vec3 result = CalcDirLight(uDirLight, normal, viewDir);

    // Point lights
    for(int i = 0; i < NR_POINT_LIGHTS; i++) {
        if (i >= vNumPointLights){break;}
        result += CalcPointLight(uPointLights[i], normal, vFragPos, viewDir); 
    }

    highp float gamma = 2.2;
    result = pow(result, vec3(1.0/gamma));

    //gl_FragColor = vec4(vec3(texture2D(uShadowMap, vTextureCoord)), 1);
    gl_FragColor = vec4(result, 1.0);
    
}
