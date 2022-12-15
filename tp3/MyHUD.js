import { MyQuad } from "./MyQuad.js"
import { CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
export class MyHUD {
    constructor(scene, board) {
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
    }

    setTime(i) {
        this.time[0] = Math.floor(i/100) % 10
        this.time[1] = Math.floor(i/10) % 10
        this.time[2] = i % 10
    }

    setScore(i, p) {
        p = p-1;
        this.count[p][0] = Math.floor(i/10) % 10
        this.count[p][1] = i % 10
    }

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

    statusLine() {
        if(this.board.playingDemo) {
            this.demoLine();
        } else if(this.board.gameOver) {

        } else {
            this.playerLine();
        }
    }


    display() {
        this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

        this.appearance.apply();
        this.scene.setActiveShaderSimple(this.textShader);

        this.scene.pushMatrix();
        this.scene.loadIdentity();

        this.scene.translate(-25,12,-50);
        this.scoreLine(1);

        this.scene.translate(0,-1,0);
        this.scoreLine(2);

        this.scene.translate(0,-1,0);
        this.statusLine();

        this.scene.popMatrix();
        this.scene.setActiveShaderSimple(this.scene.defaultShader);
        this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
        return;
    }
}