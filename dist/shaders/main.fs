varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;
varying lowp vec4 vColor;

uniform sampler2D uSampler;

void main(void) {
    highp vec4 color = vColor;
    gl_FragColor = color * vec4(vLighting, 1) * texture2D(uSampler, vTextureCoord);
}