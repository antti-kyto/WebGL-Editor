varying highp vec3 vFragPos;
varying highp vec3 vNormal;
varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;
varying lowp vec3 vViewPos;

uniform sampler2D uSampler;

void main(void) {

    // Ambient
    highp vec3 ambient = 0.1 * vec3(1.0,1.0,1.0);
    highp vec3 lightColor = vec3(1.0,1.0,0.94);

    // Diffuse
    highp vec3 lightDir = normalize(vec3(1.0,1.0,0.0));
    highp float diff = max(dot(vNormal, lightDir), 0.0);
    highp vec3 diffuse = diff * lightColor;

    // Specular
    highp vec3 viewDir = normalize(vViewPos - vFragPos);
    highp vec3 reflectDir = reflect(-lightDir, vNormal);  
    highp float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    highp vec3 specular = 0.40 * spec * lightColor;  

    highp vec3 result = (ambient + diffuse + specular) * vec3(vColor);
    gl_FragColor = vec4(result, 1.0)*texture2D(uSampler, vTextureCoord);
}