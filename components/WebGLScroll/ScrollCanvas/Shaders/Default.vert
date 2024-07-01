precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform vec2 uPlaneOffset;
uniform float uScroll;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 newPosition = position + vec3(uPlaneOffset.x, uPlaneOffset.y - uScroll, 0.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
