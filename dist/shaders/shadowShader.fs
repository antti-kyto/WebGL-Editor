precision mediump float;

void main()
{
    gl_FragColor = vec4(vec3(gl_FragCoord.b), 1.0);
}