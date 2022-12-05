import { MyCylinder } from "./MyCylinder.js"
import { MyPatch } from "./MyPatch.js"
import { MyTorus } from "./MyTorus.js"
import { CGFappearance, CGFtexture } from '../lib/CGF.js';

export class MyButton {
    constructor(scene, board, id, radius, height, position) {
        this.scene = scene;
        this.board = board;
        this.cylinder = new MyCylinder(this.scene, "", radius, radius, height, 18, 1);
        this.position = position;
        this.id = id;
        this.height = height;

        let semi1 = 
        [[[ -radius, 0, height, 1 ],[ -radius, radius*1.314, height, 1 ],[ radius, radius*1.314, height, 1 ],[ radius,  0, height, 1 ]],
        [[ -radius, 0, height, 1 ],[ -radius, 0, height, 5 ],[ radius,  0, height, 5 ],[ radius,  0, height, 1 ]]]

        let semi2 = 
        [[[ -radius, 0, height, 1 ],[ -radius, 0, height, 5 ],[ radius,  0, height, 5 ],[ radius,  0, height, 1 ]]
        ,[[ -radius, 0, height, 1 ],[ -radius, -radius*1.314, height, 1 ],[ radius, -radius*1.314, height, 1 ],[ radius,  0, height, 1 ]]]


        this.semicircle1 = new MyPatch(this.scene, 1, 12, 3, 12, semi1);
        this.semicircle2 = new MyPatch(this.scene, 1, 12, 3, 12, semi2);

        this.torus = new MyTorus(this.scene, id, radius/8, radius, 18, 8);

        this.mat = new CGFappearance(this.scene);
        this.mat.setShininess(10);
        this.mat.setEmission(0,0,0,0);
        this.mat.setAmbient(0,0.05,0,1);
        this.mat.setDiffuse(0.4,0.5,0.4,1);
        this.mat.setSpecular(0.4,0.07,0.4,1);

        this.mat2 = new CGFappearance(this.scene);
        this.mat2.setShininess(77);
        this.mat2.setEmission(0,0,0,0);
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
        //console.log(prog);
        let offset = -Math.sin(prog)*this.height*0.5;
        this.animMatrix = mat4.translate(this.animMatrix, this.animMatrix, [0,0,offset]);
    }

    playAnim() {
        this.beginAnim = true;
    }

    display() {
        this.scene.pushMatrix();
        this.mat.apply()
        this.scene.multMatrix(this.position);

        if(this.animMatrix != null) {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.animMatrix);
        }

        this.scene.registerForPick(this.id, this.semicircle1);
        this.scene.registerForPick(this.id, this.semicircle2);
        this.scene.registerForPick(this.id, this.cylinder);
        this.cylinder.display();    
        this.semicircle1.display();
        this.semicircle2.display();

        if(this.animMatrix != null) {
            this.scene.popMatrix();
        }


        this.mat2.apply();
        this.torus.display();

        this.scene.popMatrix();
        return;
    }
}