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
        this.texCoords = [];

        var angSlice = 0;
        var angLoop = 0;
        var alphaAng = 2*Math.PI/this.slices;

        var nextSlice = angSlice+alphaAng;
        var nextLoop = angLoop+alphaAng;

        var accSlices = 0;

        var textLoopDiv = 1 / this.loops;
        var textSliceDiv = 1 / this.slices;
        var textS = 0;
        var textSNext = textSliceDiv;
        var textT = 0;
        var textTNext = textLoopDiv;

        for(var j = 0; j < this.loops; j++) { //basically make a bunch of stacked cylinders

            let cosLoop = Math.cos(angLoop);
            let cosNLoop = Math.cos(nextLoop);
            let sinLoop = Math.sin(angLoop);
            let sinNLoop = Math.sin(nextLoop)

            for(var i = 0; i < this.slices; i++){
                // All vertices have to be declared for a given face
                // even if they are shared with others, as the normals 
                // in each face will be different

                let sinSlice = Math.sin(angSlice);
                let sinNSlice = Math.sin(nextSlice);
                let cosSlice = Math.cos(angSlice);
                let cosNSlice = Math.cos(nextSlice);

                var xcord = (this.outer+this.inner*cosLoop)*cosSlice;
                var ycord = (this.outer+this.inner*cosLoop)*sinSlice;
                var zcordLoop = this.inner*Math.sin(angLoop);

                var xcordNextSlice = (this.outer+this.inner*cosLoop)*cosNSlice;
                var ycordNextSlice = (this.outer+this.inner*cosLoop)*sinNSlice;

                var xcordNextLoop = (this.outer+this.inner*cosNLoop)*cosSlice;
                var ycordNextLoop = (this.outer+this.inner*cosNLoop)*sinSlice;

                var xcordNextSliceLoop = (this.outer+this.inner*cosNLoop)*cosNSlice;
                var ycordNextSliceLoop = (this.outer+this.inner*cosNLoop)*sinNSlice;
                var zcordNextLoop = this.inner*sinNLoop;
                

                var vert1 = [xcord, ycord, zcordLoop]; 
                var vert2 = [xcordNextSlice, ycordNextSlice, zcordLoop];
                var vert3 = [xcordNextLoop, ycordNextLoop, zcordNextLoop];
                var vert4 = [xcordNextSliceLoop, ycordNextSliceLoop, zcordNextLoop];

                this.vertices.push(...vert1); //0
                this.vertices.push(...vert2); //1
                this.vertices.push(...vert3); //2
                this.vertices.push(...vert4); //3

                var normal1 = [cosLoop*cosSlice, cosLoop*sinSlice, sinLoop];
                var normal2 = [cosLoop*cosNSlice, cosLoop*sinNSlice, sinLoop];
                var normal3 = [cosNLoop*cosSlice, cosNLoop*sinSlice, sinNLoop];
                var normal4 = [cosNLoop*cosNSlice, cosNLoop*sinNSlice, sinNLoop];
                this.normals.push(...normal1);
                this.normals.push(...normal2);
                this.normals.push(...normal3);
                this.normals.push(...normal4);

                //textures
                this.texCoords.push(textS, textT);
                this.texCoords.push(textSNext, textT);
                this.texCoords.push(textS, textTNext);
                this.texCoords.push(textSNext, textTNext);


                this.indices.push(accSlices+4*i, (accSlices+4*i+1), (accSlices+4*i+2));
                this.indices.push( (accSlices+4*i+1),  (accSlices+4*i+3), (accSlices+4*i+2));
                
                angSlice+=alphaAng;
                nextSlice += alphaAng;

                textS += textSliceDiv;
                textSNext += textSliceDiv;
            }

            accSlices += 4*this.slices;
            angLoop += alphaAng;
            nextLoop += alphaAng;

            textT += textLoopDiv;
            textTNext += textLoopDiv;
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
