varying highp vec3 vFragPos;
varying highp vec3 vNormal;
varying highp vec3 vTangent;
varying highp vec3 vBitangent;
varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;
varying lowp vec3 vViewPos;
varying highp vec4 vFragPosLightSpace;

struct Material {
    sampler2D diffuse;
}; 
uniform Material uMaterial;

void main(void) {
    gl_FragColor = vec4(texture2D(uMaterial.diffuse, vTextureCoord));    
}
