import { MyPrimitive } from './MyPrimitive.js';
/**
* MyTorus
* @constructor

 * @param scene - Reference to scene object
 * @param id - Object id
 * @param inner - inner radius
 * @param outer - outer radius
 * @param slices - divisions along radius
 * @param loops - divisions along z axis
*/
export class MyTorus extends MyPrimitive {
    constructor(scene, id, inner, outer, slices, loops) {
        super(scene);
        this.id = id;
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        //this.baseTexCoords = [];

        var angSlice = 0;
        var angLoop = 0;
        var alphaAng = 2*Math.PI/this.slices;

        var nextSlice = angSlice+alphaAng;
        var nextLoop = angLoop+alphaAng;

        var accSlices = 0;

        var xPos = 0.0;
        var yPos = 0.0;

        for(var j = 0; j < this.loops; j++) { //basically make a bunch of stacked cylinders

            for(var i = 0; i < this.slices; i++){
                // All vertices have to be declared for a given face
                // even if they are shared with others, as the normals 
                // in each face will be different

                var xcord = (this.outer+this.inner*Math.cos(angLoop))*Math.cos(angSlice);
                var ycord = (this.outer+this.inner*Math.cos(angLoop))*Math.sin(angSlice);
                var zcordLoop = this.inner*Math.sin(angLoop);

                var xcordNextSlice = (this.outer+this.inner*Math.cos(angLoop))*Math.cos(nextSlice);
                var ycordNextSlice = (this.outer+this.inner*Math.cos(angLoop))*Math.sin(nextSlice);

                var xcordNextLoop = (this.outer+this.inner*Math.cos(nextLoop))*Math.cos(angSlice);
                var ycordNextLoop = (this.outer+this.inner*Math.cos(nextLoop))*Math.sin(angSlice);

                var xcordNextSliceLoop = (this.outer+this.inner*Math.cos(nextLoop))*Math.cos(nextSlice);
                var ycordNextSliceLoop = (this.outer+this.inner*Math.cos(nextLoop))*Math.sin(nextSlice);
                var zcordNextLoop = this.inner*Math.sin(nextLoop);
                

                var vert1 = [xcord, ycord, zcordLoop]; 
                var vert2 = [xcordNextSlice, ycordNextSlice, zcordLoop];
                var vert3 = [xcordNextLoop, ycordNextLoop, zcordNextLoop];
                var vert4 = [xcordNextSliceLoop, ycordNextSliceLoop, zcordNextLoop];

                this.vertices.push(...vert1); //0
                this.vertices.push(...vert2); //1
                this.vertices.push(...vert3); //2
                this.vertices.push(...vert4); //3

                var cp = this.crossProduct(vert1, vert2, vert3);
                this.normals.push(...cp);
                this.normals.push(...cp);
                this.normals.push(...cp);
                this.normals.push(...cp);

                this.indices.push(accSlices+4*i, (accSlices+4*i+1), (accSlices+4*i+2));
                this.indices.push( (accSlices+4*i+1),  (accSlices+4*i+3), (accSlices+4*i+2));
                
                angSlice+=alphaAng;
                nextSlice += alphaAng;
            }

            accSlices += 4*this.slices;
            angLoop += alphaAng;
            nextLoop += alphaAng;
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
     * Called when user interacts with GUI to change object's radius.
     * @param {integer} outter - changes number of slices
     */
    updateRadius(outer){
        this.outer = outer;
    
        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}
