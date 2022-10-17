import { CGFobject } from '../lib/CGF.js';

export class MyPrimitive extends CGFobject{
    constructor(scene) {
        super(scene);
    }

    /**
     * Normalize a 3D vector
     * @param {float[]} cp Array with 3 entries (3D Vector)
     * @returns Normalized array
     */
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
    
    /**
     * Caculates crossProduct between 3 points
     * @param {float[]} vert1 Array representing a 3D point
     * @param {float[]} vert2 Array representing a 3D point
     * @param {float[]} vert3 Array representing a 3D point
     * @returns Cross Product of vectors formed by points, normalized
     */
    crossProduct(vert1, vert2, vert3) {
        var vec1 = [vert2[0]-vert1[0], vert2[1]-vert1[1], vert2[2]-vert1[2]];
        var vec2 = [vert3[0]-vert1[0], vert3[1]-vert1[1], vert3[2]-vert1[2]];
        var cp = [vec1[1]*vec2[2] - vec1[2]*vec2[1], vec1[2]*vec2[0] - vec1[0]*vec2[2], vec1[0]*vec2[1] - vec1[1]*vec2[0]];
        return this.normalize(cp);
    }

    /**
     * Updates length for s and t
     * @param {float} s 
     * @param {float} t 
     */
    setLength(s, t) {
        this.texCoords = [];
		for(var i = 0; i < this.baseTexCoords.length; i+=2) {
            this.texCoords.push(this.baseTexCoords[i] / s);
            this.texCoords.push(this.baseTexCoords[i+1] / t);
        }
        this.updateTexCoordsGLBuffers();
	}

    /**
     * Subtracts two points
     * @param {float[]} A Array representing a 3D point
     * @param {float[]} B Array representing a 3D point
     * @returns Array of subtraction
     */
    subtractPoints(A, B) {
        return A.map((valueA, indexInA) => valueA - B[indexInA])
    }

    /**
     * Multplies all elements of vector by a given value
     * @param {float[]} vec Vector
     * @param {float} val Value to multiply by
     * @returns Multiplied vector
     */
    multVector(vec, val) {
        for(let i = 0; i < vec.length; i++) {
            vec[i] *= val;
        }
        return vec;
    }

    /**
     * Floats a vector by a given angle
     * @param {float[]} vec Vector array
     * @param {float} ang Angles in degrees
     * @returns Rotated vector
     */
    rotateVector(vec, ang)
    {
        ang = -ang * (Math.PI/180);
        var cos = Math.cos(ang);
        var sin = Math.sin(ang);
        return new Array(Math.round(10000*(vec[0] * cos - vec[1] * sin))/10000, Math.round(10000*(vec[0] * sin + vec[1] * cos))/10000);
    }

    /**
     * Checks if primitive is quadratic, overriden for non-quadratic primitives
     * @returns true
     */
    isQuadratic() {
        return true;
    }
}