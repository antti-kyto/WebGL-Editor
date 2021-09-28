varying highp vec2 vTextureCoord;
varying lowp vec4 vColor;

uniform sampler2D uSampler;

void main(void) {
    highp vec4 color = vColor;
    gl_FragColor = color * texture2D(uSampler, vTextureCoord);
}