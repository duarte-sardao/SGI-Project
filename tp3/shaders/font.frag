#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform bool drawred;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);

	if (color.a < 0.5)
		discard;
	else
		if (drawred)
			gl_FragColor = vec4(1,0,0,1);
		else 
			gl_FragColor = color;
}


