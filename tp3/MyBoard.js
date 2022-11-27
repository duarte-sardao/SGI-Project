import { CGFappearance } from "../lib/CGF.js";
import { MyPiece } from "./MyPiece.js"

export class MyBoard{
    constructor(scene, graph, size, spot_size, piece_radius, piece_height, mats) {
        this.scene = scene;
        this.graph = graph;
        this.size = size;
        this.mats = mats;
        this.spots = [];
        this.pieces1 = [];
        this.pieces2 = [];

        let spawnpiece = false;
        let skiplines = false;
        let piecesSpawn = 0;
        for(let y = 0; y < size; y++){
            if(!skiplines && y == (size / 2)-1)
                skiplines = true;
            if(skiplines && y == (size / 2)+1) {
                piecesSpawn = 1;
                skiplines = false;
            }
            for(let x = 0; x < size; x++) {
                if(!skiplines && spawnpiece) {
                    var piece = new MyPiece(this.scene, this, piece_radius, piece_height, mats[piecesSpawn], x, -y);
                    if(piecesSpawn < 1)
                        this.pieces1.push(piece);
                    else
                        this.pieces2.push(piece);
                }
                spawnpiece = !spawnpiece;
            }
            spawnpiece = !spawnpiece;
        }

        this.app1 = new CGFappearance(this.scene);
        this.app1.setShininess(mats[0][0]);
        this.app1.setEmission(mats[0][1][0], mats[0][1][1], mats[0][1][2], mats[0][1][3]);
        this.app1.setAmbient(mats[0][2][0], mats[0][2][1], mats[0][2][2], mats[0][2][3]);
        this.app1.setDiffuse(mats[0][3][0], mats[0][3][1], mats[0][3][2], mats[0][3][3]);
        this.app1.setSpecular(mats[0][4][0], mats[0][4][1], mats[0][4][2], mats[0][4][3]);

        this.app2 = new CGFappearance(this.scene);
        this.app2.setShininess(mats[1][0]);
        this.app2.setEmission(mats[1][1][0], mats[1][1][1], mats[1][1][2], mats[1][1][3]);
        this.app2.setAmbient(mats[1][2][0], mats[1][2][1], mats[1][2][2], mats[1][2][3]);
        this.app2.setDiffuse(mats[1][3][0], mats[1][3][1], mats[1][3][2], mats[1][3][3]);
        this.app2.setSpecular(mats[1][4][0], mats[1][4][1], mats[1][4][2], mats[1][4][3]);
    }

    updateAnimations(t) {

    }

    display() {
        this.app1.apply();
        for(let i = 0; i < this.pieces1.length; i++) {
            this.pieces1[i].display();
        }

        this.app2.apply();
        for(let i = 0; i < this.pieces2.length; i++) {
            this.pieces2[i].display();
        }
    }
}