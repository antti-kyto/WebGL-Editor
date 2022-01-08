attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexTangent;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uViewPos;
uniform mat4 uLightSpaceMatrix;

varying highp vec3 vFragPos;
varying highp vec3 vNormal;
varying highp vec3 vTangent;
varying highp vec3 vBitangent;
varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;
varying lowp vec3 vViewPos;
varying highp vec4 vFragPosLightSpace;

void main(void) {
    
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
    vFragPos = vec3(uModelMatrix * aVertexPosition);
    vNormal = normalize(mat3(uNormalMatrix) * aVertexNormal);
    
    highp vec3 T = normalize(vec3(uNormalMatrix * aVertexTangent));
    vTangent = normalize(T - dot(T, vNormal) * vNormal);
    vBitangent = cross(vNormal, vTangent);

    vTextureCoord = aTextureCoord;
    vColor = aVertexColor;
    vViewPos = uViewPos;

    vFragPosLightSpace = uLightSpaceMatrix * vec4(vFragPos, 1.0);
}