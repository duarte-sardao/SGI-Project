import { MyCylinder } from "./MyCylinder.js"
import { MyPatch } from "./MyPatch.js"
import { MyArcAnimation } from "./MyArcAnimation.js"
import { CGFappearance, CGFtexture } from '../lib/CGF.js';

export class MyPiece {
    constructor(scene, board, id, piece_radius, piece_height, position, mat, selectmat, player) {
        this.scene = scene;
        this.board = board;
        this.cylinder = new MyCylinder(this.scene, "", piece_radius, piece_radius, piece_height, 10, 1);
        this.cylinderKing = new MyCylinder(this.scene, "", piece_radius, piece_radius, piece_height*2, 10, 1);
        this.position = position;
        this.id = id;
        this.piece_height = piece_height;
        this.mat = mat;
        this.selectmat = selectmat;
        this.player = player;

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

        this.moveUp = mat4.create();
        this.moveUp = mat4.translate(this.moveUp, this.moveUp, [0, 0, piece_height]);

        this.king = false;
        this.active = true;
    }

    getPlayer() {
        return this.player;
    }

    isKing() {
        return this.king;
    }

    makeKing(value) {
        this.king = value;
    }

    updateAnimations(t) {
        if(this.animation != null) {
            this.animation.update(t);
            this.position = this.animation.getMatrix();
            if(this.animation.getDone())
                this.animation = null;
        }
    }

    move(target, speed=1) {
        this.animation = new MyArcAnimation(this.scene, this.position, target, speed, 0.5, this.piece_height*3);
    }

    capture(target, speed=2) {
        this.active = false;
        this.king = false;
        this.animation = new MyArcAnimation(this.scene, this.position, target, speed, 0.8, this.piece_height*5, 0.9);
    }

    unCapture(target, speed=1) {
        this.active = true;
        this.animation = new MyArcAnimation(this.scene, this.position, target, speed, 0.2, this.piece_height*5);
    }

    display(selected) {
        this.scene.pushMatrix();
        if(selected) {
            this.selectmat.apply()
            //this.scene.multMatrix(this.moveUp)
        }
        else
            this.mat.apply()
        this.scene.multMatrix(this.position);

        if(this.active) {
            this.scene.registerForPick(this.id, this.semicircle3);
            this.scene.registerForPick(this.id, this.semicircle4);
        }
        if(!this.king) {
            this.cylinder.display();    
            this.semicircle1.display();
            this.semicircle2.display();
            if(this.active) {
                this.scene.registerForPick(this.id, this.semicircle1);
                this.scene.registerForPick(this.id, this.semicircle2);
                this.scene.registerForPick(this.id, this.cylinder);
            }
        } else {
            this.cylinderKing.display();    
            this.semicircle1King.display();
            this.semicircle2King.display();
            if(this.active) {
                this.scene.registerForPick(this.id, this.semicircle1King);
                this.scene.registerForPick(this.id, this.semicircle2King);
                this.scene.registerForPick(this.id, this.cylinderKing);
            }
        }
        this.semicircle3.display();
        this.semicircle4.display();

        this.scene.popMatrix();
        return;
    }
}