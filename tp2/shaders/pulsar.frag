#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform float r;
uniform float g;
uniform float b;
uniform float timeFactor;

void main() {
	gl_FragColor = vec4(r, g, b, 1.0*(sin(timeFactor)+1.0)/2.0);
}
