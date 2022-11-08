
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float timeFactor;
uniform float normScale;

void main() {
	vec3 offset=vec3(0.0,0.0,0.0);

	offset=aVertexNormal*normScale*0.02*(sin(timeFactor)+1.0)/2.0; //0.02 hack
	
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);
}

