import {MyPrimitive} from './MyPrimitive.js'
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyRectangle extends MyPrimitive {
	constructor(scene, id, x1, x2, y1, y2) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.verSlices = Math.ceil(Math.abs(x1-x2))*5;
		this.horSlices = Math.ceil(Math.abs(y1-y2))*5;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.baseTexCoords = [];

		var xStep = (this.x2-this.x1) / this.verSlices;
		var yStep = (this.y2-this.y1) / this.horSlices;

		var curX = this.x1;
		var acc = 0;

		for(let i = 0; i < this.verSlices; i++) {
			var nextX = curX + xStep;
			var curY = this.y1;

			for(let j = 0; j < this.horSlices; j++) {
				var nextY = curY + yStep;

				this.vertices.push(...[curX, curY, 0]);
				this.vertices.push(...[nextX, curY, 0]);
				this.vertices.push(...[curX, nextY, 0]);
				this.vertices.push(...[nextX, nextY, 0]);

				this.indices.push(...[0+acc, 1+acc, 2+acc, 1+acc,3+acc,2+acc]);

				for(let k = 0; k < 4; k++)
					this.normals.push(...[0,0,1]);

				this.baseTexCoords.push(...[-curX, -curY]);
				this.baseTexCoords.push(...[-nextX, -curY]);
				this.baseTexCoords.push(...[-curX, -nextY]);
				this.baseTexCoords.push(...[-nextX, -nextY]);


				curY = nextY;
				acc += 4;
			}

			curX = nextX;
		}
		/**
		this.vertices = [
			this.x1, this.y1, 0,	//0
			this.x2, this.y1, 0,	//1
			this.x1, this.y2, 0,	//2
			this.x2, this.y2, 0		//3
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			1, 3, 2
		];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];
		

		this.baseTexCoords = [
			this.x1, this.y2,
			this.x2, this.y2,
			this.x1, this.y1,
			this.x2, this.y1
		]*/
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	
	isQuadratic() {
		return false;
	}


}

