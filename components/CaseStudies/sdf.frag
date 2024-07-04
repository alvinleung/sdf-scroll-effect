precision mediump float;

uniform vec2 uMouseUv;
varying vec2 vUv;

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

void main() {
    // translate uv to center
    vec2 uv = vUv - vec2(.5, .5);

    // make mouse into +.5 to -.5 instead of +1 to -1
    float mouseCircle = 1.0 - sdCircle(uv + uMouseUv, .1) * 4.0;

    // 1.0 to invert the colour
    float baseCircle = 1.0 - sdCircle(uv, 0.25) * 4.0;

    // float combinedCircle = mouseCircle + baseCircle;
    float combinedCircle = mouseCircle + baseCircle;

    vec4 combinedColor = vec4(uv, mouseCircle, 1.0);
    // gl_FragColor = vec4(vec3(baseCircle), 1.0);
    gl_FragColor = vec4(combinedColor);

    // Output UV square
    // gl_FragColor = vec4(vUv, 0.0, 1.0);
}
