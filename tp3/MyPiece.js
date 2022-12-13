import { MyCylinder } from "./MyCylinder.js"
import { MyPatch } from "./MyPatch.js"
import { MyArcAnimation } from "./MyArcAnimation.js"
import { CGFOBJModel } from "./CGFOBJModel.js"
import { CGFappearance, CGFtexture } from '../lib/CGF.js';

export class MyPiece {
    constructor(scene, board, id, piece_radius, piece_height, position, mat, selectmat, player) {
        this.scene = scene;
        this.board = board;
        this.cylinder = new MyCylinder(this.scene, "", piece_radius, piece_radius, piece_height, 12, 1);
        this.cylinderKing = new MyCylinder(this.scene, "", piece_radius, piece_radius, piece_height*2, 10, 1);
        this.position = position;
        this.id = id;
        this.piece_height = piece_height;
        this.mat = mat;
        this.selectmat = selectmat;
        this.player = player;

        let semi1 = 
        [[[ -piece_radius, 0, 0, 1 ],[ -piece_radius, 0, 0, 5 ],[ piece_radius,  0, 0, 5 ],[ piece_radius,  0, 0, 1 ]],
        [[ -piece_radius, 0, 0, 1 ],[ -piece_radius, piece_radius*1.314, 0, 1 ],[ piece_radius, piece_radius*1.314, 0, 1 ],[ piece_radius,  0, 0, 1 ]]]

        let semi2 = 
        [[[ -piece_radius, 0, 0, 1 ],[ -piece_radius, -piece_radius*1.314, 0, 1 ],[ piece_radius, -piece_radius*1.314, 0, 1 ],[ piece_radius,  0, 0, 1 ]]
        ,[[ -piece_radius, 0, 0, 1 ],[ -piece_radius, 0, 0, 5 ],[ piece_radius,  0, 0, 5 ],[ piece_radius,  0, 0, 1 ]]]


        this.semicircle1 = new MyPatch(this.scene, 1, 8, 3, 8, semi1);
        this.semicircle2 = new MyPatch(this.scene, 1, 8, 3, 8, semi2);
        this.circle1 = new CGFOBJModel(this.scene, "models/piecetop.obj");

        this.circleMove = mat4.create();
        this.circleMove = mat4.translate(this.circleMove, this.circleMove, [0,0,piece_height]);
        this.circleScale = mat4.create();
        this.circleScale = mat4.scale(this.circleScale, this.circleScale, [piece_radius, piece_radius, piece_radius]);

        this.moveUp = mat4.create();
        this.moveUp = mat4.translate(this.moveUp, this.moveUp, [0, 0, piece_height/2]);

        this.king = false;
        this.active = true;
        this.cylUsed = this.cylinder;
        this.lastPos = mat4.create();
    }

    getPlayer() {
        return this.player;
    }

    isKing() {
        return this.king;
    }

    makeKing(value) {
        this.king = value;
        if(value) {
            this.cylUsed = this.cylinderKing;
        } else {
            this.cylUsed = this.cylinder;
        }
    }

    updateAnimations(t) {
        if(this.animation != null) {
            this.animation.update(t);
            this.position = this.animation.getMatrix();
            if(this.animation.getDone()) {
                this.animation = null;
            }
        }
    }

    move(target, speed=1) {
        this.animation = new MyArcAnimation(this.scene, this.position, target, speed, 0.5, this.piece_height*3);
    }

    capture(target, speed=2) {
        this.active = false;
        this.makeKing(false);
        this.animation = new MyArcAnimation(this.scene, this.position, target, speed, 0.8, this.piece_height*5, 0.9);
    }

    unCapture(target, speed=1) {
        this.active = true;
        this.animation = new MyArcAnimation(this.scene, this.position, target, speed, 0.2, this.piece_height*5);
    }

    getPos() {
        return this.lastPos;
    }

    display(selected, playable) {
        this.scene.pushMatrix();
        if(selected || playable) {
            this.selectmat.apply()
            if(selected)
                this.scene.multMatrix(this.moveUp)
        }
        else
            this.mat.apply()
        this.scene.multMatrix(this.position);

        if(this.id == 18) {
            this.scene.lights[5].setVisible(true);
            this.scene.lights[5].update();
        }

        if(this.active) {
            this.scene.registerForPick(this.id, this.circle1);
            this.scene.registerForPick(this.id, this.semicircle1);
            this.scene.registerForPick(this.id, this.semicircle2);
            this.scene.registerForPick(this.id, this.cylUsed);
        }

        this.cylUsed.display();
        this.semicircle1.display();
        this.semicircle2.display();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.circleMove);
        if(this.king)
            this.scene.multMatrix(this.circleMove);
        this.scene.multMatrix(this.circleScale);
        this.circle1.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
        return;
    }
}