#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform float r;
uniform float g;
uniform float b;
uniform float mat_r;
uniform float mat_g;
uniform float mat_b;
uniform float timeFactor;

void main() {
	float scale = 1.0*(sin(timeFactor)+1.0)/2.0;
	gl_FragColor = vec4(mat_r*(1.0-scale), mat_g*(1.0-scale), mat_b*(1.0-scale), 1.0) + vec4(r*scale, g*scale, b*scale, 1.0);
}
