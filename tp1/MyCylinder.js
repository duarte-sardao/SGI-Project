import {CGFobject} from '../lib/CGF.js';
/**
* MyCylinder
* @constructor
 * @param scene - Reference to scene object
 * @param id - Object id
 * @param base - base (z=0) radius
 * @param top - top (z=height) radius
 * @param height - Height
 * @param slices - divisions along radius
 * @param stacks - divisions along z axis
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
        var yPos = 0.0;

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

                var vert1 = [ca, -sa, curheight];
                var vert2 = [caa, -saa, curheight];
                var vert3 = [eca, -esa, nextheight];
                var vert4 = [ecaa, -esaa, nextheight];

                this.vertices.push(...vert1);
                this.vertices.push(...vert2);
                this.vertices.push(...vert3);
                this.vertices.push(...vert4); //add twice for inside faces
                this.vertices.push(...vert1);
                this.vertices.push(...vert2);
                this.vertices.push(...vert3);
                this.vertices.push(...vert4);


                //normal with cross product
                var vec1 = [vert2[0]-vert1[0], vert2[1]-vert1[1], vert2[2]-vert1[2]];
                var vec2 = [vert3[0]-vert1[0], vert3[1]-vert1[1], vert3[2]-vert1[2]];
                var cp = [vec1[1]*vec2[2] - vec1[2]*vec2[1], vec1[2]*vec2[0] - vec1[0]*vec2[2], vec1[0]*vec2[1] - vec1[1]*vec2[0]];
                var nsize = Math.sqrt(
                    cp[0]*cp[0]+
                    cp[1]*cp[1]+
                    cp[2]*cp[2]
                    );
                cp[0]/=nsize;
                cp[1]/=nsize;
                cp[2]/=nsize;
                this.normals.push(...cp);
                this.normals.push(...cp);
                this.normals.push(...cp);
                this.normals.push(...cp);
                cp[0]*=(-1);
                cp[1]*=(-1);  
                cp[2]*=(-1);
                this.normals.push(...cp);
                this.normals.push(...cp);
                this.normals.push(...cp);
                this.normals.push(...cp);    
                            
                for(var k = 0; k < 2; k++) {
                    this.texCoords.push(xPos,yPos);
                    this.texCoords.push(xPos + (1/this.slices), yPos);
                    this.texCoords.push(xPos, yPos+(1/this.stacks));
                    this.texCoords.push(xPos + (1/this.slices),yPos+(1/this.stacks));
                }

                this.indices.push(accslices+8*i, (accslices+8*i+1) , (accslices+8*i+2) );
                this.indices.push((accslices+8*i+3), (accslices+8*i+2), (accslices+8*i+1) );
                this.indices.push((accslices+8*i+2+4), (accslices+8*i+1+4), accslices+8*i+4);
                this.indices.push((accslices+8*i+1+4), (accslices+8*i+2+4), (accslices+8*i+3+4));
                
                
                ang+=alphaAng;
                xPos += 1/this.slices;
            }

            yPos += 1/this.stacks;
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


