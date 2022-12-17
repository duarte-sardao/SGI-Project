import { MyCylinder } from "./MyCylinder.js"
import { MyPatch } from "./MyPatch.js"
import { MyArcAnimation } from "./MyArcAnimation.js"
import { CGFOBJModel } from "./CGFOBJModel.js"
import { CGFappearance, CGFtexture } from '../lib/CGF.js';
import { MyBoard } from "./MyBoard.js";

export class MyPiece {
    /**
     * Piece constructors
     * @param {XMLScene} scene 
     * @param {MyBoard} board 
     * @param {Integer} id 
     * @param {Float} piece_radius 
     * @param {Float} piece_height 
     * @param {mat4} position 
     * @param {CGFappearance} mat 
     * @param {CGFappearance} selectmat 
     * @param {Integer} player 
     * @param {String} light 
     */
    constructor(scene, board, id, piece_radius, piece_height, position, mat, selectmat, player, light) {
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
        this.light = light;

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
        this.kingVisual = false;
        this.active = true;
        this.cylUsed = this.cylinder;
    }

    /**
     * Returns associated player
     * @returns Integer
     */
    getPlayer() {
        return this.player;
    }

    /**
     * Returns if is king
     * @returns boolean
     */
    isKing() {
        return this.king;
    }

    /**
     * Updates to be king or not
     * @param {boolean} value 
     */
    makeKing(value,delay) {
        if(this.king == value)
            return;
        this.king = value;
        var t = this;
        setTimeout(function(value) {t.makeKingVisually(value);}, delay*1000, value)
    }

    makeKingVisually(value) {
        this.kingVisual = value;
        if(value) {
            this.cylUsed = this.cylinderKing;
        } else {
            this.cylUsed = this.cylinder;
        }
    }

    /**
     * Updates animations given time
     * @param {float} t 
     * @returns True if animation ended, else false
     */
    updateAnimations(t) {
        if(this.animation != null) {
            this.animation.update(t);
            this.position = this.animation.getMatrix();
            if(this.animation.getDone()) {
                this.animation = null;
                if(this.movedlight) {
                    this.scene.lights[this.scene.lightId[this.light]].disable();
                    this.scene.lights[this.scene.lightId[this.light]].update();
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Moves to a position
     * @param {mat4} target 
     * @param {float} speed (time in seconds for movement so higher is slower)
     */
    move(target, speed=1) {
        this.animation = new MyArcAnimation(this.scene, this.position, target, speed, 0.5, this.piece_height*3);
    }

    /**
     * Moves to a position after capture, with delay arc pronounced at the end and undoing king status
     * @param {mat4} target 
     * @param {float} speed 
     */
    capture(target, speed=2) {
        this.active = false;
        this.wasKing = this.king;
        this.makeKing(false, 0.9);
        this.animation = new MyArcAnimation(this.scene, this.position, target, speed, 0.8, this.piece_height*5, 0.9);
    }

    /**
     * Moves to a position undoing capture(arc is pronounced at the beggining)
     * @param {mat4} target 
     * @param {float} speed 
     */
    unCapture(target, speed=1) {
        this.active = true;
        if(this.wasKing)
            this.makeKing(true, speed);
        this.animation = new MyArcAnimation(this.scene, this.position, target, speed, 0.2, this.piece_height*5);
    }

    /**
     * Displays piece
     * @param {boolean} selected Wether to apply selected transformation and special mat
     * @param {boolean} playable Wether to apply special mat
     * @param {boolean} dospot Wether to position spotlight over it
     * @returns 
     */
    display(selected, playable, dospot) {
        this.movedlight = dospot;
        this.scene.pushMatrix();
        if(selected || playable) {
            this.selectmat.apply()
            if(selected)
                this.scene.multMatrix(this.moveUp)
        }
        else
            this.mat.apply()
        this.scene.multMatrix(this.position);

        if(dospot) {
            //this.scene.lights[this.scene.lightId[this.light]].setVisible(true);
            this.scene.lights[this.scene.lightId[this.light]].enable();
            this.scene.lights[this.scene.lightId[this.light]].update();
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
        if(this.kingVisual)
            this.scene.multMatrix(this.circleMove);
        this.scene.multMatrix(this.circleScale);
        this.circle1.display();
        this.scene.popMatrix();

        this.scene.popMatrix();
        return;
    }
}