import { MyCylinder } from "./MyCylinder.js"
import { MyPatch } from "./MyPatch.js"
import { CGFappearance, CGFtexture } from '../lib/CGF.js';

export class MyPiece {
    constructor(scene, board, id, piece_radius, piece_height, position) {
        this.scene = scene;
        this.board = board;
        this.cylinder = new MyCylinder(this.scene, "", piece_radius, piece_radius, piece_height, 10, 1);
        this.cylinderKing = new MyCylinder(this.scene, "", piece_radius, piece_radius, piece_height*2, 10, 1);
        this.position = position;
        this.id = id;

        let semi1 = 
        [[[ -piece_radius, 0, piece_height, 1 ],[ -piece_radius, piece_radius*1.314, piece_height, 1 ],[ piece_radius, piece_radius*1.314, piece_height, 1 ],[ piece_radius,  0, piece_height, 1 ]],
        [[ -piece_radius, 0, piece_height, 1 ],[ -piece_radius, 0, piece_height, 5 ],[ piece_radius,  0, piece_height, 5 ],[ piece_radius,  0, piece_height, 1 ]]]

        let semi2 = 
        [[[ -piece_radius, 0, piece_height, 1 ],[ -piece_radius, 0, piece_height, 5 ],[ piece_radius,  0, piece_height, 5 ],[ piece_radius,  0, piece_height, 1 ]]
        ,[[ -piece_radius, 0, piece_height, 1 ],[ -piece_radius, -piece_radius*1.314, piece_height, 1 ],[ piece_radius, -piece_radius*1.314, piece_height, 1 ],[ piece_radius,  0, piece_height, 1 ]]]

        let semi1King = 
        [[[ -piece_radius, 0, piece_height*2, 1 ],[ -piece_radius, piece_radius*1.314, piece_height*2, 1 ],[ piece_radius, piece_radius*1.314, piece_height*2, 1 ],[ piece_radius,  0, piece_height*2, 1 ]],
        [[ -piece_radius, 0, piece_height*2, 1 ],[ -piece_radius, 0, piece_height*2, 5 ],[ piece_radius,  0, piece_height*2, 5 ],[ piece_radius,  0, piece_height*2, 1 ]]]

        let semi2King = 
        [[[ -piece_radius, 0, piece_height*2, 1 ],[ -piece_radius, 0, piece_height*2, 5 ],[ piece_radius,  0, piece_height*2, 5 ],[ piece_radius,  0, piece_height*2, 1 ]]
        ,[[ -piece_radius, 0, piece_height*2, 1 ],[ -piece_radius, -piece_radius*1.314, piece_height*2, 1 ],[ piece_radius, -piece_radius*1.314, piece_height*2, 1 ],[ piece_radius,  0, piece_height*2, 1 ]]]

        let semi3 = 
        [[[ -piece_radius, 0, 0, 1 ],[ -piece_radius, 0, 0, 5 ],[ piece_radius,  0, 0, 5 ],[ piece_radius,  0, 0, 1 ]],
        [[ -piece_radius, 0, 0, 1 ],[ -piece_radius, piece_radius*1.314, 0, 1 ],[ piece_radius, piece_radius*1.314, 0, 1 ],[ piece_radius,  0, 0, 1 ]]]

        let semi4 = 
        [[[ -piece_radius, 0, 0, 1 ],[ -piece_radius, -piece_radius*1.314, 0, 1 ],[ piece_radius, -piece_radius*1.314, 0, 1 ],[ piece_radius,  0, 0, 1 ]]
        ,[[ -piece_radius, 0, 0, 1 ],[ -piece_radius, 0, 0, 5 ],[ piece_radius,  0, 0, 5 ],[ piece_radius,  0, 0, 1 ]]]

        this.semicircle1 = new MyPatch(this.scene, 1, 6, 3, 6, semi1);
        this.semicircle2 = new MyPatch(this.scene, 1, 6, 3, 6, semi2);
        this.semicircle1King = new MyPatch(this.scene, 1, 6, 3, 6, semi1King);
        this.semicircle2King = new MyPatch(this.scene, 1, 6, 3, 6, semi2King);
        this.semicircle3 = new MyPatch(this.scene, 1, 6, 3, 6, semi3);
        this.semicircle4 = new MyPatch(this.scene, 1, 6, 3, 6, semi4);

        this.king = false;

    }

    isKing() {
        return this.king;
    }

    makeKing() {
        this.king = true;
    }

    updateAnimations(t) {

    }

    display() {
        this.scene.pushMatrix();
        this.scene.multMatrix(this.position);

        this.scene.registerForPick(this.id, this.semicircle1);
        this.scene.registerForPick(this.id, this.semicircle2);
        this.scene.registerForPick(this.id, this.semicircle3);
        this.scene.registerForPick(this.id, this.semicircle4);
        this.scene.registerForPick(this.id, this.cylinder);
        if(!this.king) {
            this.cylinder.display();    
            this.semicircle1.display();
            this.semicircle2.display();
        } else {
            this.cylinderKing.display();    
            this.semicircle1King.display();
            this.semicircle2King.display();
        }
        this.semicircle3.display();
        this.semicircle4.display();

        this.scene.popMatrix();
        return;
    }
}