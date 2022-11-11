import { MyAnimation } from "./MyAnimation.js"

export class MyKeyframeAnimation extends MyAnimation{
    constructor(scene, keyframes) {
        super(scene);
        this.index = 0;
        this.keyframes = keyframes;
        this.draw = false;
    }

    /**
     * Get animation matrix from an object and a scalar
     * @param {keyframe object} keyObj object defining keyframe transformations
     * @param {keyframe object} prevkeyObj object defining keyframe transformations of the last keyframe
     * @param {float} scalar value to scale the transformations by 0-1
     */
    animMatrix(keyObj, prevkeyObj, scalar) {
        var DEGREE_TO_RAD = Math.PI / 180;
        var transfMatrix = mat4.create();
        var translate = [];
        var scale = [];
        for(let i = 0; i < 3; i++) { //from the last keyframe, add the transformation that moves it towards the next, scaled by percentage time completion (scalar)
            translate[i] = prevkeyObj['trans'][i]+(keyObj['trans'][i] - prevkeyObj['trans'][i])*scalar;
            scale[i] = prevkeyObj['scale'][i]+(keyObj['scale'][i] - prevkeyObj['scale'][i])*scalar;
        }
        transfMatrix = mat4.translate(transfMatrix, transfMatrix, translate);
        transfMatrix = mat4.rotateX(transfMatrix, transfMatrix, (prevkeyObj['xrot']+(keyObj['xrot']-prevkeyObj['xrot'])*scalar)*DEGREE_TO_RAD);
        transfMatrix = mat4.rotateY(transfMatrix, transfMatrix, (prevkeyObj['yrot']+(keyObj['yrot']-prevkeyObj['yrot'])*scalar)*DEGREE_TO_RAD);
        transfMatrix = mat4.rotateZ(transfMatrix, transfMatrix, (prevkeyObj['zrot']+(keyObj['zrot']-prevkeyObj['zrot'])*scalar)*DEGREE_TO_RAD);
        transfMatrix = mat4.scale(transfMatrix, transfMatrix, scale);
        return transfMatrix;
    }

    /**
     * Calculates the matrix for the final animation which remains static at the end
     * @param {animation object} keyObj 
     */
    finalAnimMatrix(keyObj) {
        var auxobj = {}
        auxobj['trans'] = [0,0,0];
        auxobj['xrot'] = 0;
        auxobj['yrot'] = 0;
        auxobj['zrot'] = 0;
        auxobj['scale'] = [0,0,0]; //dont want to modify matrix, all values set to 0
        return this.animMatrix(keyObj, auxobj, 1);
    }

    update(t) {
        if(this.finalAnimation != null) //dont need updating if its over
            return;
        let keyframe = this.keyframes[this.index]; //get current keyframe
        if(this.index == 0 && keyframe[0] > t) { //keyframe[0] == keyframe instant, if were at the first keyframe and havent reached its instant, dont draw anything
            this.draw = false;
            return;
        } else { //otherwise we can calculate
            let curTrans = null; //matrix to transform
            if(keyframe[0] < t) { //check if seconds > instants
                this.index++; //increment to next keyframe
                if(this.index >= this.keyframes.length) { //is the final keyframe over?
                    curTrans = this.finalAnimMatrix(keyframe[1]); //use its transform matrix for this frame
                    this.finalAnimation = true; //and save we got it so we stop calculations
                }
                else //not the final keyframe
                    keyframe = this.keyframes[this.index]; //update keyframe based on new index
            }
            if(curTrans == null) { //if yet to be defined (not final ekyframe)
                let prev = this.keyframes[this.index-1]; //get last keyframe
                var scalar = (t-prev[0]) / (keyframe[0]-prev[0]); //calculate scalar (0-1 float based on how close a keyframe is to reaching its final instant)
                curTrans = this.animMatrix(keyframe[1], prev[1], scalar); //calculate matrix based on the two keyframes and its scalar
            }
            this.matrix = curTrans;
        }
        this.draw = true;
    };

    doDraw() {
        return this.draw;
    }
}