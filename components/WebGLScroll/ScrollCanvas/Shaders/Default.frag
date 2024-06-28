precision mediump float;

uniform float uTime;
uniform vec2 uMouse;
uniform sampler2D uTexture;

varying vec2 vUv;

float sdfCircle(vec2 st, vec2 center) {
  return length(st - center) * 2.0;
}

void main() {
  vec2 uv = vUv;
  gl_FragColor = vec4(1.0);
}
