precision mediump float;

uniform vec2 uMouseUv;
uniform float uPlaneAspect;
varying vec2 vUv;

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdfBox(vec2 position, vec2 halfSize, float cornerRadius) {
    position = abs(position) - halfSize + cornerRadius;
    return length(max(position, 0.0)) + min(max(position.x, position.y), 0.0) - cornerRadius;
}

void main() {
    // translate uv to center
    vec2 uv = vUv - vec2(.5, .5);
    uv.y = uv.y;

    // make mouse into +.5 to -.5 instead of +1 to -1
    float mouseCircle = 1.0 - sdCircle(uv + uMouseUv, .1) * 4.0;

    // 1.0 to invert the colour
    // float baseCircle = 1.0 - sdCircle(uv, 0.25) * 4.0;
    float baseBox = 1.0 - sdfBox(uv, vec2(0.001, .001), 0.001);
    baseBox = smoothstep(0.4, 0.5, baseBox);

    // float combinedCircle = mouseCircle + baseCircle;
    float combined = mouseCircle;

    gl_FragColor = vec4(vec3(combined), 1.0);

    // Output UV square
    // gl_FragColor = vec4(vUv, 0.0, 1.0);
}
