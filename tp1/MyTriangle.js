import {MyPrimitive} from './MyPrimitive.js'
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyTriangle extends MyPrimitive {
	constructor(scene, id, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		this.z1 = z1;
		this.z2 = z2;
		this.x3 = x3;
		this.y3 = y3;
		this.z3 = z3;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3,	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2
		];

		//normals
		var cp = this.crossProduct([this.x1, this.y1, this.z1],[this.x2, this.y2, this.z2],[this.x3, this.y3, this.z3])

		this.normals = [];
		this.normals.push(...cp);
		this.normals.push(...cp);
		this.normals.push(...cp);
	

		var a = this.dist(0, 1);
		var b = this.dist(1, 2);
		var c = this.dist(0, 2);
		var cosalpha = (a*a- b*b + c*c) / (2*a*c);
		var sinalpha = Math.sqrt(1-cosalpha*cosalpha);

		var length_u = Math.max(this.x1, this.x2, this.x3) - Math.min(this.x1, this.x2, this.x3);
		var length_v = Math.max(this.y1, this.y2, this.y3) - Math.min(this.y1, this.y2, this.y3);

		this.baseTexCoords = [ //??
			0, 0,
			a/length_u, 0,
			c*cosalpha/length_u, c*sinalpha/length_v
		]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	dist(c1, c2) {

		c1 *= 3;
		c2 *= 3;
		return Math.sqrt(
			Math.pow(this.vertices[0+c2] - this.vertices[0+c1], 2) + 
			Math.pow(this.vertices[1+c2] - this.vertices[1+c1], 2) + 
			Math.pow(this.vertices[2+c2] - this.vertices[2+c1], 2)
		);
	}

	isQuadratic() {
		return false;
	}
}

