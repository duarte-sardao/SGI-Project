import { MyCylinder } from "./MyCylinder.js"
import { MyPatch } from "./MyPatch.js"
import { MyTorus } from "./MyTorus.js"
import { CGFappearance, CGFtexture } from '../lib/CGF.js';
import { CGFOBJModel } from "./CGFOBJModel.js"

export class MyButton {
    constructor(scene, board, id, size, height, position, type) {
        this.scene = scene;
        this.board = board;
        this.position = position;
        this.id = id;
        this.height = height;

        this.scaler = mat4.create();
        this.scaler = mat4.scale(this.scaler, this.scaler, [size, size, height]);

        let path = "models/"+type+"butt"+"/";
        this.butt = new CGFOBJModel(this.scene, path + "top.obj");
        this.edge = new CGFOBJModel(this.scene, path + "bottom.obj");

        this.mat = new CGFappearance(this.scene);
        this.mat.setShininess(10);
        this.mat.setEmission(0,0.1,0,0);
        this.mat.setAmbient(0,0.05,0,1);
        this.mat.setDiffuse(0.4,0.5,0.4,1);
        this.mat.setSpecular(0.4,0.07,0.4,1);

        this.mat2 = new CGFappearance(this.scene);
        this.mat2.setShininess(77);
        this.mat2.setEmission(0.1,0.1,0.1,0);
        this.mat2.setAmbient(0.25,0.25,0.25,1);
        this.mat2.setDiffuse(0.4,0.4,0.4,1);
        this.mat2.setSpecular(0.77,0.77,0.77,1);


    }

    update(t) {
        if(this.beginAnim) {
            this.startTime = t;
            this.beginAnim = false;
            return;
        }
        if(this.startTime  == null)
            return;
        this.animMatrix = mat4.create();
        let prog = ((t - this.startTime) / 0.5) * Math.PI;
        if(prog < Math.PI / 2) {
            prog *= 4;
            if(prog > Math.PI / 2) {
                prog = Math.PI / 2;
            }
        } else if (prog >= Math.PI) {
            this.animMatrix = null;
            this.startTime = null;
        }
        let offset = -Math.sin(prog)*this.height*0.1;
        this.animMatrix = mat4.translate(this.animMatrix, this.animMatrix, [0,0,offset]);
    }

    playAnim() {
        this.beginAnim = true;
    }

    display() {
        this.scene.pushMatrix();
        this.mat.apply()
        this.scene.multMatrix(this.position);
        this.scene.multMatrix(this.scaler);

        if(this.animMatrix != null) {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.animMatrix);
        }

        this.scene.registerForPick(this.id, this.butt);
        this.butt.display();

        if(this.animMatrix != null) {
            this.scene.popMatrix();
        }


        this.mat2.apply();
        this.edge.display();

        this.scene.popMatrix();
        return;
    }
}