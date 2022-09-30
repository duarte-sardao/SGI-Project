import { CGFobject } from '../lib/CGF.js';

export class MyPrimitive extends CGFobject{
    constructor(scene) {
        super(scene);
    }

    normalize(cp) {
        var nsize = Math.sqrt(
            cp[0]*cp[0]+
            cp[1]*cp[1]+
            cp[2]*cp[2]
            );
        cp[0]/=nsize;
        cp[1]/=nsize;
        cp[2]/=nsize;
        return cp;
    }
    
    crossProduct(vert1, vert2, vert3) {
        var vec1 = [vert2[0]-vert1[0], vert2[1]-vert1[1], vert2[2]-vert1[2]];
        var vec2 = [vert3[0]-vert1[0], vert3[1]-vert1[1], vert3[2]-vert1[2]];
        var cp = [vec1[1]*vec2[2] - vec1[2]*vec2[1], vec1[2]*vec2[0] - vec1[0]*vec2[2], vec1[0]*vec2[1] - vec1[1]*vec2[0]];
        return this.normalize(cp);
    }

    setLength(s, t) {
        this.texCoords = [];
		for(var i = 0; i < this.baseTexCoords.length; i+=2) {
            this.texCoords.push(this.baseTexCoords[i] / s);
            this.texCoords.push(this.baseTexCoords[i+1] / t);
        }
        this.updateTexCoordsGLBuffers();
	}

    subtractPoints(A, B) {
        return A.map((valueA, indexInA) => valueA - B[indexInA])
    }

    multVector(vec, val) {
        for(let i = 0; i < vec.length; i++) {
            vec[i] *= val;
        }
        return vec;
    }

    rotateVector(vec, ang)
    {
        ang = -ang * (Math.PI/180);
        var cos = Math.cos(ang);
        var sin = Math.sin(ang);
        return new Array(Math.round(10000*(vec[0] * cos - vec[1] * sin))/10000, Math.round(10000*(vec[0] * sin + vec[1] * cos))/10000);
    }

    isQuadratic() {
        return true;
    }
}