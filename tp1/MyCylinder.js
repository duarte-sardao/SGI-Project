import {CGFobject} from '../lib/CGF.js';
/**
* MyCylinder
* @constructor
 * @param scene - Reference to MyScene object
 * @param baseRadius - Radius at base
 * @param topRadius - Radius at the top
 * @param slices - Number of slices in rotation
 * @param height - Height
 * @param textRepeat - Amount of repetitions of texture on y scale
*/
export class MyCylinder extends CGFobject {
    constructor(scene, baseRadius, topRadius, slices, height) {
        super(scene);
        this.baseRadius = baseRadius;
        this.topRadius = topRadius;
        this.slices = slices;
        this.height = height;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var ang = 0;
        var alphaAng = 2*Math.PI/this.slices;

        var xPos = 0.0;

        for(var i = 0; i < this.slices; i++){
            // All vertices have to be declared for a given face
            // even if they are shared with others, as the normals 
            // in each face will be different

            var sa=Math.sin(ang);
            var saa=Math.sin(ang+alphaAng);
            var ca=Math.cos(ang);
            var caa=Math.cos(ang+alphaAng);

            this.vertices.push(this.baseRadius*ca, this.baseRadius*sa, 0);
            this.vertices.push(this.baseRadius*caa, this.baseRadius*saa, 0);
            this.vertices.push(this.baseRadius*caa, this.baseRadius*saa, this.height);
            this.vertices.push(this.baseRadius*ca, this.baseRadius*sa, 0);

            /**this.vertices.push(ca, 0, -sa);
            this.vertices.push(caa, 0, -saa);
            this.vertices.push(ca, this.height, -sa);
            this.vertices.push(caa, this.height, -saa);
            this.vertices.push(ca, 0, -sa);
            this.vertices.push(caa, 0, -saa);
            this.vertices.push(ca, this.height, -sa);
            this.vertices.push(caa, this.height, -saa);*/

            /**
            this.texCoords.push(xPos,this.texrep);
            this.texCoords.push(xPos + (1/this.slices) ,this.texrep);
            this.texCoords.push(xPos,0);
            this.texCoords.push(xPos + (1/this.slices),0);
            this.texCoords.push(0,0);
            this.texCoords.push(0,0);
            this.texCoords.push(0,0);
            this.texCoords.push(0,0);
            */


            //VERIFY NORMALS

            // triangle normal computed by cross product of two edges
            var normalA= [
                ca,
                0,
                -sa
            ];

            var normalB = [
                caa,
                0,
                -saa
            ];

            // normalization
            var nsize=Math.sqrt(
                normalA[0]*normalA[0]+
                normalA[1]*normalA[1]+
                normalA[2]*normalA[2]
                );
            normalA[0]/=nsize;
            normalA[1]/=nsize;
            normalA[2]/=nsize;
            normalB[0]/=nsize; //size is radius so same for both
            normalB[1]/=nsize;
            normalB[2]/=nsize;

            // push normal once for each vertex of this triangle
            this.normals.push(...normalA);
            this.normals.push(...normalB);
            this.normals.push(...normalA);
            this.normals.push(...normalB);
            this.normals.push(...normalA);
            this.normals.push(...normalB);
            this.normals.push(...normalA);
            this.normals.push(...normalB);

            this.indices.push(8*i, (8*i+1) , (8*i+2) );
            this.indices.push((8*i+3), (8*i+2), (8*i+1) );
            this.indices.push((8*i+2+4), (8*i+1+4), 8*i+4);
            this.indices.push((8*i+1+4), (8*i+2+4), (8*i+3+4));
            
            
            ang+=alphaAng;
            xPos += 1/this.slices;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    /**
     * Called when user interacts with GUI to change object's complexity.
     * @param {integer} complexity - changes number of slices
     */
    updateBuffers(complexity){
        this.slices = 3 + Math.round(5 * complexity);

        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
     /**
     * Called when user interacts with GUI to change object's height.
     * @param {integer} height - changes number of slices
     */
    updateHeight(height){
        this.height = height;
    
        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}


