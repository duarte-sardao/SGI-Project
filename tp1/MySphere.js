import { MyPrimitive } from './MyPrimitive.js';
/**
* MySphere
* @constructor

 * @param scene - Reference to scene object
 * @param id - Object id
 * @param radius - radius
 * @param slices - divisions along radius
 * @param stacks - divisions along z axis
*/
export class MySphere extends MyPrimitive {
    constructor(scene, id, radius, slices, stacks) {
        super(scene);
        this.id = id;
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        //this.baseTexCoords = [];

        var angSlice = 0;
        var alphaAng = 2*Math.PI/this.slices;

        var angStack = -Math.PI/2;
        var tetaAng = (Math.PI/2)/this.stacks;

        var nextSlice = angSlice+alphaAng;
        var nextStack = angStack+tetaAng;

        var accSlices = 0;

        var xPos = 0.0;
        var yPos = 0.0;

        for(var j = 0; j < this.stacks; j++) { //basically make a bunch of stacked cylinders

            for(var i = 0; i < this.slices; i++){
                // All vertices have to be declared for a given face
                // even if they are shared with others, as the normals 
                // in each face will be different

                var xcord = this.radius*Math.cos(angStack)*Math.cos(angSlice);
                var ycord = this.radius*Math.cos(angStack)*Math.sin(angSlice);
                var zcordStack = this.radius*Math.sin(angStack);

                var xcordNextSlice = this.radius*Math.cos(angStack)*Math.cos(nextSlice);
                var ycordNextSlice = this.radius*Math.cos(angStack)*Math.sin(nextSlice);

                var xcordNextStack = this.radius*Math.cos(nextStack)*Math.cos(angSlice);
                var ycordNextStack = this.radius*Math.cos(nextStack)*Math.sin(angSlice);

                var xcordNextSliceStack = this.radius*Math.cos(nextStack)*Math.cos(nextSlice);
                var ycordNextSliceStack = this.radius*Math.cos(nextStack)*Math.sin(nextSlice);
                var zcordNextStack = this.radius*Math.sin(nextStack);
                

                var vert1 = [xcord, ycord, zcordStack]; 
                var vert2 = [xcordNextSlice, ycordNextSlice, zcordStack];
                var vert3 = [xcordNextStack, ycordNextStack, zcordNextStack];
                var vert4 = [xcordNextSliceStack, ycordNextSliceStack, zcordNextStack];

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
            angStack += tetaAng;
            nextStack += tetaAng;
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
     * @param {integer} radius - changes number of slices
     */
    updateRadius(radius){
        this.radius = radius;
    
        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}
