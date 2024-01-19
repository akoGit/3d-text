varying vec2 vUv;
uniform float time;
uniform sampler2D marsTexture;

void main() {

  vec4 color = texture2D(marsTexture, vUv);
  
//   gl_FragColor = vec4(vUv, 1.0,1.0);
  gl_FragColor = color;
}