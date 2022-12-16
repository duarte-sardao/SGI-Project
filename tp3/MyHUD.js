import { MyQuad } from "./MyQuad.js"
import { CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyBoard } from "./MyBoard.js";
export class MyHUD {
    /**
     * Hud constructors
     * @param {XMLScene} scene scene object
     * @param {MyBoard} board board
     * @param {CGFtexture} frame frame texture (may be null)
     */
    constructor(scene, board, frame) {
        this.scene = scene;
        this.board = board;
        this.quad = new MyQuad(scene)

        this.count = [[0,0],[0,0]]
        this.time = [0,0,0]

        this.textShader=new CGFshader(this.scene.gl, "shaders/font.vert", "shaders/font.frag");
        this.textShader.setUniformsValues({'dims': [16, 16]});
        this.appearance = new CGFappearance(this.scene);
		this.fontTexture = new CGFtexture(this.scene, "shaders/oolite-font.trans.png");
		this.appearance.setTexture(this.fontTexture);

        if(frame != null) {
            this.fappearance = new CGFappearance(this.scene);
            this.fappearance.setTexture(frame);
            this.ignorelight=new CGFshader(this.scene.gl, "shaders/nolight.vert", "shaders/nolight.frag");
        }
    }

    /**
     * Gets amount of seconds to round end and updates array of digits
     * @param {Integer} i 
     */
    setTime(i) {
        this.time[0] = Math.floor(i/100) % 10
        this.time[1] = Math.floor(i/10) % 10
        this.time[2] = i % 10
    }

    /**
     * Gets score and player and updates respective array of digits
     * @param {Integer} i score
     * @param {Integer} p player
     */
    setScore(i, p) {
        p = p-1;
        this.count[p][0] = Math.floor(i/10) % 10
        this.count[p][1] = i % 10
    }

    /**
     * Displays line of score
     * @param {Integer} i player
     */
    scoreLine(i) {
        this.scene.pushMatrix();
        this.scene.activeShader.setUniformsValues({'charCoords': [3,5]});//S
        this.quad.display();
        this.scene.translate(0.5,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [3,6]});//c
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [15,6]});//o
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [2,7]});//r
        this.quad.display();
        this.scene.translate(0.3,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [5,6]});//e
        this.quad.display();
        this.scene.translate(0.6,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [i,3]});//numb
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [10,3]});//:
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [this.count[i-1][0],3]});//digi1
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [this.count[i-1][1],3]});//digi2
        this.quad.display();
        this.scene.popMatrix();
    }

    /**
     * Displays line informing turn and time left
     */
    playerLine() {
        this.scene.pushMatrix();
        this.scene.activeShader.setUniformsValues({'charCoords': [4,5]});//T
        this.quad.display();
        this.scene.translate(0.5,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [5,7]});//u
        this.quad.display();
        this.scene.translate(0.5,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [2,7]});//r
        this.quad.display();
        this.scene.translate(0.3,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [14,6]});//n
        this.quad.display();
        this.scene.translate(0.5,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [10,3]});//:
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [this.board.turn,3]});//numb
        this.quad.display();
        this.scene.translate(0.6,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [this.time[0],3]});//digi1
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords':  [this.time[1],3]});//digi2
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords':  [this.time[2],3]});//digi3
        this.quad.display();
        this.scene.popMatrix();
    }

    /**
     * Displays line informing demo is playing
     */
    demoLine() {
        this.scene.pushMatrix();
        this.scene.activeShader.setUniformsValues({'charCoords': [4,4]});//D
        this.quad.display();
        this.scene.translate(0.6,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [5,6]});//e
        this.quad.display();
        this.scene.translate(0.45,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [13,6]});//m
        this.quad.display();
        this.scene.translate(0.7,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [15,6]});//o
        this.quad.display();
        this.scene.translate(1,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [9,0]});//icon
        this.quad.display();
        this.scene.popMatrix();
    }

    /**
     * Displays line of win status
     */
    winLine() {
        this.scene.pushMatrix();
        this.scene.activeShader.setUniformsValues({'charCoords': [10,0]});//Icon
        this.quad.display();
        this.scene.translate(0.8,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [0,5]});//P
        this.quad.display();
        this.scene.translate(0.5,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [this.board.turn,3]});//numb
        this.quad.display();
        this.scene.translate(0.6,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [7,7]});//w
        this.quad.display();
        this.scene.translate(0.6,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [9,6]});//i
        this.quad.display();
        this.scene.translate(0.2,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [14,6]});//n
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [3,7]});//s
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords':  [1,2]});//!
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords':  [10,0]});//Icon
        this.quad.display();
        this.scene.popMatrix();
    }

    /**
     * Displays turn/demo/win line in respect to game state
     */
    statusLine() {
        if(this.board.playingDemo) {
            this.demoLine();
        } else if(this.board.gameOver) {
            this.winLine();
        } else {
            this.playerLine();
        }
    }

    /**
     * Displays HUD
     */
    display() {
        this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

        this.scene.pushMatrix();
        this.scene.loadIdentity();

        this.scene.translate(-25,12,-50);
        if(this.fappearance != null) {
            this.scene.setActiveShaderSimple(this.ignorelight);
            this.scene.pushMatrix();
            this.scene.translate(2, -1, 0);
            this.scene.scale(6,4,1);
            this.fappearance.apply();
            this.quad.display();
            this.scene.popMatrix();
        }

        this.appearance.apply();

        this.scene.setActiveShaderSimple(this.textShader);

        this.scoreLine(1);

        this.scene.translate(0,-1,0);
        this.scoreLine(2);

        this.scene.translate(0,-1,0);
        this.statusLine();

        this.scene.popMatrix();
        this.scene.setActiveShaderSimple(this.scene.defaultShader);
        this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
    }
}