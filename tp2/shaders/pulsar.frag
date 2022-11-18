#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float r;
uniform float g;
uniform float b;
uniform float mat_r;
uniform float mat_g;
uniform float mat_b;
uniform float timeFactor;
uniform bool hasTexture;

void main() {
	float scale = 1.0*(sin(timeFactor)+1.0)/2.0;
	vec4 pulse = vec4(mat_r*(1.0-scale), mat_g*(1.0-scale), mat_b*(1.0-scale), 1.0) + vec4(r*scale, g*scale, b*scale, 1.0);

	if(hasTexture) {
		vec4 texture = texture2D(uSampler, vTextureCoord);
		gl_FragColor = vec4(texture.r*(0.5), texture.g*(0.5), texture.b*(0.5), 1.0) + vec4(pulse.r*(0.5), pulse.g*(0.5), pulse.b*(0.5), 1.0);
	} else {
		gl_FragColor = pulse;
	}
}
