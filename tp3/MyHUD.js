import { MyQuad } from "./MyQuad.js"
import { CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
export class MyHUD {
    constructor(scene, board) {
        this.scene = scene;
        this.board = board;
        this.quad = new MyQuad(scene)

        this.player = 0
        this.count = [[0,0],[0,0]]
        this.time = [0,0,0]

        this.textShader=new CGFshader(this.scene.gl, "shaders/font.vert", "shaders/font.frag");
        this.textShader.setUniformsValues({'dims': [16, 16]});
        this.appearance = new CGFappearance(this.scene);
		this.fontTexture = new CGFtexture(this.scene, "shaders/oolite-font.trans.png");
		this.appearance.setTexture(this.fontTexture);
    }

    setplayer(i) {
        this.player = i;
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

    scoreWord(i) {
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
        this.scene.activeShader.setUniformsValues({'charCoords': [this.count[i-1][0],3]});//:
        this.quad.display();
        this.scene.translate(0.4,0,0);
        this.scene.activeShader.setUniformsValues({'charCoords': [this.count[i-1][1],3]});//:
        this.quad.display();

        this.scene.popMatrix();
    }


    display() {
        this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

        this.appearance.apply();
        this.scene.setActiveShaderSimple(this.textShader);

        this.scene.pushMatrix();
        this.scene.loadIdentity();

        this.scene.translate(-25,12,-50);
        this.scoreWord(1);

        this.scene.translate(0,-1,0);
        this.scoreWord(2);

        this.scene.translate(0,-1,0);

        this.scene.popMatrix();
        this.scene.setActiveShaderSimple(this.scene.defaultShader);
        this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
        return;
    }
}