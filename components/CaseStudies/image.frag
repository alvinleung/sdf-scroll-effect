precision mediump float;

uniform vec2 uMouseUv;
uniform float uPlaneAspect;
uniform sampler2D uTexture;
varying vec2 vUv;

float sdCircle(vec2 st, vec2 center) {
    return length(st - center) * 2.0;
}
float fill(float x, float size, float edge) {
    return 1.0 - smoothstep(size - edge, size + edge, x);
}
float sdfBox(vec2 position, vec2 halfSize, float cornerRadius) {
    position = abs(position) - halfSize + cornerRadius;
    return length(max(position, 0.0)) + min(max(position.x, position.y), 0.0) - cornerRadius;
}

float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p - 0.5) * 4.2 - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

float stroke(float x, float size, float w, float edge) {
    float d = smoothstep(size - edge, size + edge, x + w * 0.5) - smoothstep(size - edge, size + edge, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

void main() {
    // SCALING TEXTURE
    vec2 centeredUv = vUv - 0.5;

    // Adjust the texture coordinates based on the aspect ratio
    if (uPlaneAspect > 1.0) {
        // Wide image: scale height
        centeredUv.y /= uPlaneAspect;
    } else {
        // Tall image: scale width
        centeredUv.x *= uPlaneAspect;
    }
    vec2 scaledUv = centeredUv + 0.5;

    // SDF Circle
    float circleSize = 0.02; // value below 1 create droplet effect
    float circleEdge = 0.5;
    float sdfCircle = fill(
            sdCircle(centeredUv, -1. * uMouseUv),
            circleSize,
            circleEdge
        );
    float sdfCircleBig = fill(
            sdCircle(centeredUv, -1. * uMouseUv),
            circleSize * 7.0,
            circleEdge
        );

    float centerDist = distance(vec2(0, 0), uMouseUv);

    // SDF rect
    float size = 1.0;
    float roundness = 0.1;

    float sdf = sdRoundRect(scaledUv, vec2(size), roundness);
    // sdf = stroke(sdf, 0.0, borderSize, 0.0);
    sdf = smoothstep(.5, .49, sdf + sdfCircle);

    vec4 color = texture2D(uTexture, scaledUv);
    color += color * (sdfCircleBig * centerDist) * 9.0;
    gl_FragColor = vec4(color.xyz * sdf, 1.0);
}
