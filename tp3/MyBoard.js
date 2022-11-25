import { MyPatch } from "./MyPatch.js"

export class MyBoard{
    constructor(scene, graph, size, spot_size, piece_radius, piece_height, mats, transformation) {
        this.scene = scene;
        this.graph = graph;
        this.size = size;
        this.mats = mats;
        this.transformation = transformation;
        this.spots = [];
        this.pieces1 = [];
        this.pieces2 = [];
        for(let i = 0; i < size; i++) {
            var subspots = [];
            for(let j = 0; j < size; j++) {
                let id = i.toString() + "_" + j.toString();
                let controlpoints = [
                    [
                        [0, spot_size, 0.0, 1 ],
                        [spot_size, spot_size, 0.0, 1 ]
                        
                    ],
                    [
                        [ spot_size, 0, 0.0, 1 ],
                        [ spot_size, spot_size, 0.0, 1 ]							 
                    ]
                ];
                let patch = new MyPatch(this.scene, 1, 10*spot_size, 1, 10*spot_size, controlpoints);
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
        this.scene.multMatrix(this.transformation);
        //spots1

        //spots2

        //pieces1

        //pieces2
        this.scene.popMatrix();
    }
}