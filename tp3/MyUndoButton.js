import { MyCylinder } from "./MyCylinder.js"
import { MyPatch } from "./MyPatch.js"
import { MyTorus } from "./MyTorus.js"
import { CGFappearance, CGFtexture } from '../lib/CGF.js';

export class MyUndoButton {
    constructor(scene, board, id, radius, height, position) {
        this.scene = scene;
        this.board = board;
        this.cylinder = new MyCylinder(this.scene, "", radius, radius, height, 10, 1);
        this.position = position;
        this.id = id;

        let semi1 = 
        [[[ -radius, 0, height, 1 ],[ -radius, radius*1.314, height, 1 ],[ radius, radius*1.314, height, 1 ],[ radius,  0, height, 1 ]],
        [[ -radius, 0, height, 1 ],[ -radius, 0, height, 5 ],[ radius,  0, height, 5 ],[ radius,  0, height, 1 ]]]

        let semi2 = 
        [[[ -radius, 0, height, 1 ],[ -radius, 0, height, 5 ],[ radius,  0, height, 5 ],[ radius,  0, height, 1 ]]
        ,[[ -radius, 0, height, 1 ],[ -radius, -radius*1.314, height, 1 ],[ radius, -radius*1.314, height, 1 ],[ radius,  0, height, 1 ]]]


        this.semicircle1 = new MyPatch(this.scene, 1, 6, 3, 6, semi1);
        this.semicircle2 = new MyPatch(this.scene, 1, 6, 3, 6, semi2);

        this.torus = new MyTorus(this.scene, id, radius/8, radius, 10, 10);

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

    display() {
        this.scene.pushMatrix();
        this.mat.apply()
        this.scene.multMatrix(this.position);


        this.scene.registerForPick(this.id, this.semicircle1);
        this.scene.registerForPick(this.id, this.semicircle2);
        this.scene.registerForPick(this.id, this.cylinder);
        this.cylinder.display();    
        this.semicircle1.display();
        this.semicircle2.display();
        this.mat2.apply();
        this.torus.display();

        this.scene.popMatrix();
        return;
    }
}