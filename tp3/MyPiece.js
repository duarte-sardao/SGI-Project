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

        this.crownmat = new CGFappearance(this.scene);
        this.crownmat.setShininess(51.2);
        this.crownmat.setEmission(0.1, 0.06, 0.01, 0);
        this.crownmat.setAmbient(0.24725, 0.1995, 0.0745, 1);
        this.crownmat.setDiffuse(0.75164, 0.60648, 0.22648, 1);
        this.crownmat.setSpecular(0.628281, 0.555802, 0.366065, 1);

        this.selectcrownmat = new CGFappearance(this.scene);
        this.selectcrownmat.setShininess(51.2);
        this.selectcrownmat.setEmission(0.45, 0.3, 0.1, 1);
        this.selectcrownmat.setAmbient(0.24725, 0.1995, 0.0745, 1);
        this.selectcrownmat.setDiffuse(0.75164, 0.60648, 0.22648, 1);
        this.selectcrownmat.setSpecular(0.628281, 0.555802, 0.366065, 1);

        let semi1 = 
        [[[ -piece_radius, 0, 0, 1 ],[ -piece_radius, 0, 0, 5 ],[ piece_radius,  0, 0, 5 ],[ piece_radius,  0, 0, 1 ]],
        [[ -piece_radius, 0, 0, 1 ],[ -piece_radius, piece_radius*1.314, 0, 1 ],[ piece_radius, piece_radius*1.314, 0, 1 ],[ piece_radius,  0, 0, 1 ]]]

        let semi2 = 
        [[[ -piece_radius, 0, 0, 1 ],[ -piece_radius, -piece_radius*1.314, 0, 1 ],[ piece_radius, -piece_radius*1.314, 0, 1 ],[ piece_radius,  0, 0, 1 ]]
        ,[[ -piece_radius, 0, 0, 1 ],[ -piece_radius, 0, 0, 5 ],[ piece_radius,  0, 0, 5 ],[ piece_radius,  0, 0, 1 ]]]


        this.semicircle1 = new MyPatch(this.scene, 1, 8, 3, 8, semi1);
        this.semicircle2 = new MyPatch(this.scene, 1, 8, 3, 8, semi2);
        this.circle1 = new CGFOBJModel(this.scene, "models/piecetop.obj");
        this.crown = new CGFOBJModel(this.scene, "models/crown.obj");

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
    makeKing(value,delay=0) {
        if(this.king == value)
            return;
        this.king = value;
        var t = this;
        setTimeout(function(value) {t.makeKingVisually(value);}, delay*1000, value)
    }

    
    /**
     * Updates to king visual look
     * @param {boolean} value 
     */
    makeKingVisually(value) {
        this.kingVisual = value;
        if(value) { //use tall or small cylinder base on value
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
            if(this.animation.getDone()) { //ended
                this.animation = null;
                if(this.movedlight) { //if we had control of light, disable it
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
        this.wasKing = this.king; //not king when captured, but keep track of last state
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
        if(this.wasKing) //reset king status
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
        this.movedlight = dospot; //keep track if we were told to move the spotlight
        this.scene.pushMatrix();
        if(selected || playable) { //selected material is used when a piece is selected or playable
            this.selectmat.apply()
            if(selected) //but if selected, the piece moves up a bit
                this.scene.multMatrix(this.moveUp)
        }
        else
            this.mat.apply()
        this.scene.multMatrix(this.position);

        if(dospot) {//update spotlight
            this.scene.lights[this.scene.lightId[this.light]].enable();
            this.scene.lights[this.scene.lightId[this.light]].update();
        }

        if(this.active) { //register if active
            this.scene.registerForPick(this.id, this.circle1);
            this.scene.registerForPick(this.id, this.semicircle1);
            this.scene.registerForPick(this.id, this.semicircle2);
            this.scene.registerForPick(this.id, this.cylUsed);
        }

        this.cylUsed.display();
        this.semicircle1.display();
        this.semicircle2.display();

        this.scene.pushMatrix();
        this.scene.multMatrix(this.circleMove);//move the top towards z
        if(this.kingVisual)
            this.scene.multMatrix(this.circleMove); //if were king, move twice the distance
        this.scene.multMatrix(this.circleScale);
        this.circle1.display();
        if(this.kingVisual){
            if(selected || playable)
                this.selectcrownmat.apply();
            else
                this.crownmat.apply();
            this.crown.display();
        }
        this.scene.popMatrix();

        this.scene.popMatrix();
        return;
    }
}