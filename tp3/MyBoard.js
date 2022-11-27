import { CGFappearance } from "../lib/CGF.js";
import { MyPiece } from "./MyPiece.js"
import { MyRectangle } from "./MyRectangle.js"

export class MyBoard{
    constructor(scene, graph, size, spot_size, piece_radius, piece_height, mats) {
        this.scene = scene;
        this.graph = graph;
        this.size = size;
        this.mats = mats;
        this.spots = [];
        this.pieces1 = {};
        this.pieces2 = {};
        this.spots = {};

        let spawnpiece = false;
        let skiplines = false;
        let piecesSpawn = 1;
        let curPiece = 1;
        for(let y = 0; y < size; y++){
            if(!skiplines && y == (size / 2)-1)
                skiplines = true;
            if(skiplines && y == (size / 2)+1) {
                piecesSpawn = 2;
                skiplines = false;
                curPiece = 1;
            }
            for(let x = 0; x < size; x++) {
                let position = mat4.create();
                position = mat4.translate(position, position, [x, -y, 0]);
                if(!skiplines && spawnpiece) {
                    var piece = new MyPiece(this.scene, this, piece_radius, piece_height, position);
                    let id = String(piecesSpawn) + "_" + String(curPiece);
                    curPiece++;
                    if(piecesSpawn < 2)
                        this.pieces1[id] = piece;
                    else
                        this.pieces2[id] = piece;
                }
                if(spawnpiece) {
                    let quadId = String(x) + "_" + String(y);
                    let spotRect = new MyRectangle(this.scene, "", -spot_size/2, spot_size/2, - spot_size/2, spot_size/2);
                    let spotObj = {}
                    spotObj['rect'] = spotRect; spotObj['pos'] = position;
                    this.spots[quadId] = spotObj;
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

    logPicking()
	{
		if (this.scene.pickMode == false) {
			// results can only be retrieved when picking mode is false
			if (this.scene.pickResults != null && this.scene.pickResults.length > 0) {
				for (var i=0; i< this.scene.pickResults.length; i++) {
					var obj = this.scene.pickResults[i][0];
					if (obj)
					{
						var customId = this.scene.pickResults[i][1];				
						console.log("Picked object: " + obj + ", with pick id " + customId);
					}
				}
				this.scene.pickResults.splice(0,this.scene.pickResults.length);
			}		
		}
	}

    display() {
        this.scene.setPickEnabled(true);
        this.logPicking();

        this.app1.apply();
        for(const piece in this.pieces1) {
            this.scene.registerForPick(piece, this.pieces1[piece]);
            this.pieces1[piece].display();
        }

        this.app2.apply();
        for(const piece in this.pieces2) {
            this.scene.registerForPick(piece, this.pieces2[piece]);
            this.pieces2[piece].display();
        }

        for(const spot in this.spots) {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.spots[spot]['pos']);
            this.spots[spot]['rect'].display();
            this.scene.popMatrix();
        }

        //this.scene.setPickEnabled(false);
    }
}