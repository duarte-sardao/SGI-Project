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
        this.pieceInSpots = {};

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
                if(spawnpiece) {
                    let quadId = "spot_" + String(x) + "_" + String(y);
                    let spotRect = new MyRectangle(this.scene, "", -spot_size/2, spot_size/2, - spot_size/2, spot_size/2);
                    let spotObj = {}
                    spotObj['rect'] = spotRect; spotObj['pos'] = position;
                    spotObj['piece'] = "empty"
                    if(!skiplines) {
                        let id = "piece_" + String(piecesSpawn) + "_" + String(curPiece);
                        var piece = new MyPiece(this.scene, this, id, piece_radius, piece_height, position);
                        curPiece++;
                        if(piecesSpawn < 2)
                            this.pieces1[id] = piece;
                        else
                            this.pieces2[id] = piece;
                        spotObj['piece'] = id;
                        this.pieceInSpots[id] = quadId;
                    }
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

        this.app1_high = new CGFappearance(this.scene);
        this.app1_high.setShininess(mats[0][0]);
        this.app1_high.setEmission(0.45, 0.3, 0.1, 1);
        this.app1_high.setAmbient(mats[0][2][0], mats[0][2][1], mats[0][2][2], mats[0][2][3]);
        this.app1_high.setDiffuse(mats[0][3][0], mats[0][3][1], mats[0][3][2], mats[0][3][3]);
        this.app1_high.setSpecular(mats[0][4][0], mats[0][4][1], mats[0][4][2], mats[0][4][3]);

        this.app2 = new CGFappearance(this.scene);
        this.app2.setShininess(mats[1][0]);
        this.app2.setEmission(mats[1][1][0], mats[1][1][1], mats[1][1][2], mats[1][1][3]);
        this.app2.setAmbient(mats[1][2][0], mats[1][2][1], mats[1][2][2], mats[1][2][3]);
        this.app2.setDiffuse(mats[1][3][0], mats[1][3][1], mats[1][3][2], mats[1][3][3]);
        this.app2.setSpecular(mats[1][4][0], mats[1][4][1], mats[1][4][2], mats[1][4][3]);

        this.app2_high = new CGFappearance(this.scene);
        this.app2_high.setShininess(mats[1][0]);
        this.app2_high.setEmission(0.45, 0.3, 0.1, 1);
        this.app2_high.setAmbient(mats[1][2][0], mats[1][2][1], mats[1][2][2], mats[1][2][3]);
        this.app2_high.setDiffuse(mats[1][3][0], mats[1][3][1], mats[1][3][2], mats[1][3][3]);
        this.app2_high.setSpecular(mats[1][4][0], mats[1][4][1], mats[1][4][2], mats[1][4][3]);

        this.scene.setPickEnabled(true);

        this.turn = 1;
        this.selected = "piece_1_10"

        this.moveUp = mat4.create();
        this.moveUp = mat4.translate(this.moveUp, this.moveUp, [0, 0, piece_height]);

        this.moveList = []
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
                        const words = customId.split('_');
                        if(words[0] == "piece" && this.turn == int(words[1])) {
                            this.selected = customId;
                        }
                        if(words[0] == "spot" && this.selected != null) {
                            this.doMove(this.selected, customId);
                        }
					}
				}
				this.scene.pickResults.splice(0,this.scene.pickResults.length);
			}		
		}
	}

    doMove(piece, spot) {
        this.selected = null;
        let valid = false;

        const spotArr = spot.split('_');
        const orgSpotArr = this.pieceInSpots[piece].split('_');
        const pieceArr = piece.split('_');

        const diff_x = int(spotArr[1]) - int(orgSpotArr[1]);
        const diff_y = int(spotArr[2]) - int(orgSpotArr[2]);

        if(Math.abs(diff_x) == 1 && this.spots[spot]['piece'] == "empty") {
            if(diff_y == 1)
                valid = true;
            else {
                if(pieceArr[1] == '1')
                    valid = this.pieces1[piece].isKing();
                else if(pieceArr[1] == '2') {
                    valid = this.pieces2[piece].isKing();
                }
            }
        }
        else if(Math.abs(diff_x) == 2 && Math.abs(diff_y) == 2) {
            const mid_x = orgSpotArr[1] + diff_x;
            const mid_y = orgSpotArr[2] + diff_y;
            let mid_id = "spot_" + mid_x + "_" + mid_y;
            let mid_obj = this.spots[mid_id]['piece'].split('_');
            if(mid_obj[0] == "piece" && mid_obj[1] != pieceArr[1]) {
                valid = true;
                //capture mid_obj
            }
        }

        if(valid) {
            let move = piece + "!" + spot;
            this.moveList.push(move);
            this.spots[spot]['piece'] = piece;
            this.pieceInSpots[piece] = spot;
        }
    }

    display() {
        this.logPicking();

        this.app1.apply();
        for(const piece in this.pieces1) {
            if(piece == this.selected) {
                this.app1_high.apply();
                this.scene.pushMatrix();
                this.scene.multMatrix(this.moveUp);
            }
            this.pieces1[piece].display();
            if(piece == this.selected) {
                this.app1.apply();
                this.scene.popMatrix();
            }
        }

        this.app2.apply();
        for(const piece in this.pieces2) {
            if(piece == this.selected) {
                this.app2_high.apply();
                this.scene.pushMatrix();
                this.scene.multMatrix(this.moveUp);
            }
            this.pieces2[piece].display();
            if(piece == this.selected) {
                this.app2.apply();
                this.scene.popMatrix();
            }
        }

        for(const spot in this.spots) {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.spots[spot]['pos']);
            this.scene.registerForPick(spot, this.spots[spot]['rect']);
            this.spots[spot]['rect'].display();
            this.scene.popMatrix();
        }

    }
}