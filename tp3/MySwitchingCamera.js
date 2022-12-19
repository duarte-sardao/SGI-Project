import { CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyBoard } from "./MyBoard.js";
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
        this.cams = cams;
        this.id = id;
        this.cur = 0;
        this.curvals = [...cams[0]]
        this.graph.cameras[id] = this.curvals;
    }
}