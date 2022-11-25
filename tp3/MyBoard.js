import { MyRectangle } from "./MyRectangle.js"

export class MyBoard{
    constructor(scene, graph, size, spot_size, piece_radius, piece_height, mats) {
        this.scene = scene;
        this.graph = graph;
        this.size = size;
        this.mats = mats;
        this.spots = [];
        this.pieces1 = [];
        this.pieces2 = [];
        for(let i = 0; i < size; i++) {
            var subspots = [];
            for(let j = 0; j < size; j++) {
                let id = i.toString() + "_" + j.toString();
                let rect = new MyRectangle(this.scene, id, 0, spot_size, 0, spot_size)
                //spot obj
                //subspots[j] = new Spot(scene, id, patch);
            }
            this.spots[i] = subspots;
        }
        //add pieces
    }

    updateAnimations(t) {

    }

    display() {
        return;
        //spots

        //pieces1

        //pieces2
    }
}