attribute vec4 aVertexPosition;

uniform mat4 uLightSpaceMatrix;
uniform mat4 uModelMatrix;


void main()
{   
    gl_Position = uLightSpaceMatrix * uModelMatrix * aVertexPosition;
}