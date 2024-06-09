precision lowp float;

uniform vec2 uSize;
uniform vec2 uMPos;
uniform float uTime;
void main() {
    vec3 color = vec3(1.);
    vec2 c = gl_FragCoord.xy;
    vec2 ce = ((uMPos)  - c) / 10.;
    float d = dot(ce, ce);


    color *= cos(d / 6.);
    color = sin(color * uTime / 1000.) * 2. - 1.;

    gl_FragColor = vec4(color, 1.0);
}
