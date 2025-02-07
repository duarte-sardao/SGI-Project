
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float timeFactor;
uniform float normScale;

varying vec2 vTextureCoord;

void main() {
	vec3 offset=vec3(0.0,0.0,0.0);

	offset=aVertexNormal*(normScale-1.0)*(sin(timeFactor)+1.0)/2.0; //size increased is based on normal (at 2, vertexes move to end point of normal, 1.5 midpoint etc)
	
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);

	vTextureCoord = aTextureCoord;
}

