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
    }

    updateAnimations(t) {

    }

    display() {
        for(let i = 0; i < this.pieces1.length; i++) {
            this.pieces1[i].display();
        }

        for(let i = 0; i < this.pieces2.length; i++) {
            this.pieces2[i].display();
        }
    }
}