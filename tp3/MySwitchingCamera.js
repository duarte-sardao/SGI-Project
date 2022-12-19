import { CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyBoard } from "./MyBoard.js";
import { CGFcamera } from '../lib/CGF.js';
export class MySwitchingCamera {
    /**
     * Hud constructors
     * @param {XMLScene} scene scene object
     * @param {MyBoard} board board
     * @param {SceneGraph} graph 
     * @param {Array} cams list of cam positions
     * @param {String} id text id
     */
    constructor(scene, board, graph, cams, id) {
        this.scene = scene;
        this.board = board;
        this.graph = graph;

        this.graph.cameras[id] = [...cams[0]];
        
        this.cams = this.treat(cams);
        this.id = id;
        this.cur = 0;
        this.curvals = [...this.cams[0]];
    }

    treat(cams) {
        let ncams = [];
        for(let i = 0; i < cams.length; i++) {
            let cam = cams[i];
            cam.shift();
            cam = cam.flat();
            cam[2] = cam[2] * Math.PI / 180;
            ncams.push(cam);
        }
        return ncams;
    }

    switch() {
        this.origin = [...this.curvals];
        this.cur = (this.cur + 1) % this.cams.length;
        this.target = [...this.cams[this.cur]];
        this.beginswitch = true;
    }

    update(t) {
        if(this.beginswitch) {
            this.time = t;
            this.beginswitch = false;
            return;
        }
        if(this.time == null)
            return;
        let timediff = (t-this.time)/1.5;
        if(timediff > 1)
            timediff = 1;
        for(let i = 0; i < this.origin.length; i++) {
            this.curvals[i] = this.origin[i] + (this.target[i]-this.origin[i])*timediff;
        }
        if(timediff == 1)
            this.time = null;
        console.log(timediff);
        this.setcam();
    }

    setcam() {
        let pos = this.scene.cameraList[this.id];
        var camObj = new CGFcamera(this.curvals[2], this.curvals[0], this.curvals[1], [this.curvals[3],this.curvals[4],this.curvals[5]],[this.curvals[6],this.curvals[7],this.curvals[8]]);
        this.scene.cameras[pos] = camObj;
        this.scene.updateCamera();
    }
}