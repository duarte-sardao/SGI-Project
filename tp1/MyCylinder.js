import {CGFobject} from '../lib/CGF.js';
/**
* MyCylinder
* @constructor
 * @param scene - Reference to MyScene object
 * @param complexity - Object complexity (number of faces)
 * @param height - Height
 * @param textRepeat - Amount of repetitions of texture on y scale
*/
export class MyCylinder extends CGFobject {
    constructor(scene, id, base, top, height, slices, stacks) {
        super(scene);
        this.id = id;
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;
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

        var org = this.base;
        var radstep = (this.top - this.base) / this.stacks;
        var end = org + radstep;
        var curheight = 0;
        var heightstep = this.height / this.stacks;
        var nextheight = heightstep;
        var accslices = 0;

        for(var j = 0; j < this.stacks; j++) { //basically make a bunch of stacked cylinders

            for(var i = 0; i < this.slices; i++){
                // All vertices have to be declared for a given face
                // even if they are shared with others, as the normals 
                // in each face will be different

                var sa=Math.sin(ang)*org;
                var saa=Math.sin(ang+alphaAng)*org;
                var ca=Math.cos(ang)*org;
                var caa=Math.cos(ang+alphaAng)*org;

                var esa=Math.sin(ang)*end;
                var esaa=Math.sin(ang+alphaAng)*end;
                var eca=Math.cos(ang)*end;
                var ecaa=Math.cos(ang+alphaAng)*end;

                this.vertices.push(ca, -sa, curheight);
                this.vertices.push(caa, -saa, curheight);
                this.vertices.push(eca, -esa, nextheight);
                this.vertices.push(ecaa, -esaa, nextheight);
                this.vertices.push(ca, -sa, curheight);
                this.vertices.push(caa, -saa, curheight);
                this.vertices.push(eca, -esa, nextheight);
                this.vertices.push(ecaa, -esaa, nextheight);

                
                this.texCoords.push(xPos,1.0);
                this.texCoords.push(xPos + (1/this.slices) ,1.0);
                this.texCoords.push(xPos,0);
                this.texCoords.push(xPos + (1/this.slices),0);
                this.texCoords.push(0,0);
                this.texCoords.push(0,0);
                this.texCoords.push(0,0);
                this.texCoords.push(0,0);


                // triangle normal computed by cross product of two edges
                var normalA= [
                    ca,
                    -sa,
                    curheight
                ];

                var normalB = [
                    caa,
                    -saa,
                    curheight
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

                this.indices.push(accslices+8*i, (accslices+8*i+1) , (accslices+8*i+2) );
                this.indices.push((accslices+8*i+3), (accslices+8*i+2), (accslices+8*i+1) );
                this.indices.push((accslices+8*i+2+4), (accslices+8*i+1+4), accslices+8*i+4);
                this.indices.push((accslices+8*i+1+4), (accslices+8*i+2+4), (accslices+8*i+3+4));
                
                
                ang+=alphaAng;
                xPos += 1/this.slices;
            }

            accslices += 8*this.slices;
            org = end;
            end += radstep;
            curheight = nextheight;
            nextheight += heightstep;
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


