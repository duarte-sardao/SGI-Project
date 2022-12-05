import { CGFappearance } from "../lib/CGF.js";
import { MyPiece } from "./MyPiece.js"
import { MyRectangle } from "./MyRectangle.js"
import { MyButton } from "./MyButton.js"

export class MyBoard{
    constructor(scene, graph, id, size, spot_size, piece_radius, piece_height, mats) {
        this.scene = scene;
        this.graph = graph;
        this.size = size;
        this.spot_size = spot_size;
        this.piece_height = piece_height;
        this.piece_radius = piece_radius;
        this.mats = mats;
        this.pieces = {};
        this.spots = {};
        this.pieceInSpots = {};
        this.curID = id;
        this.locationSpots = [...Array(size)].map(_=>Array(size).fill(0));;

        let app1 = new CGFappearance(this.scene);
        app1.setShininess(mats[0][0]);
        app1.setEmission(mats[0][1][0], mats[0][1][1], mats[0][1][2], mats[0][1][3]);
        app1.setAmbient(mats[0][2][0], mats[0][2][1], mats[0][2][2], mats[0][2][3]);
        app1.setDiffuse(mats[0][3][0], mats[0][3][1], mats[0][3][2], mats[0][3][3]);
        app1.setSpecular(mats[0][4][0], mats[0][4][1], mats[0][4][2], mats[0][4][3]);

        let app1_high = new CGFappearance(this.scene);
        app1_high.setShininess(mats[0][0]);
        app1_high.setEmission(0.45, 0.3, 0.1, 1);
        app1_high.setAmbient(mats[0][2][0], mats[0][2][1], mats[0][2][2], mats[0][2][3]);
        app1_high.setDiffuse(mats[0][3][0], mats[0][3][1], mats[0][3][2], mats[0][3][3]);
        app1_high.setSpecular(mats[0][4][0], mats[0][4][1], mats[0][4][2], mats[0][4][3]);

        let app2 = new CGFappearance(this.scene);
        app2.setShininess(mats[1][0]);
        app2.setEmission(mats[1][1][0], mats[1][1][1], mats[1][1][2], mats[1][1][3]);
        app2.setAmbient(mats[1][2][0], mats[1][2][1], mats[1][2][2], mats[1][2][3]);
        app2.setDiffuse(mats[1][3][0], mats[1][3][1], mats[1][3][2], mats[1][3][3]);
        app2.setSpecular(mats[1][4][0], mats[1][4][1], mats[1][4][2], mats[1][4][3]);

        let app2_high = new CGFappearance(this.scene);
        app2_high.setShininess(mats[1][0]);
        app2_high.setEmission(0.45, 0.3, 0.1, 1);
        app2_high.setAmbient(mats[1][2][0], mats[1][2][1], mats[1][2][2], mats[1][2][3]);
        app2_high.setDiffuse(mats[1][3][0], mats[1][3][1], mats[1][3][2], mats[1][3][3]);
        app2_high.setSpecular(mats[1][4][0], mats[1][4][1], mats[1][4][2], mats[1][4][3]);

        let matArr = [null, app1, app2, app1_high, app2_high]

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
                    let spotRect = new MyRectangle(this.scene, "", -spot_size/2, spot_size/2, - spot_size/2, spot_size/2);
                    let spotObj = {}
                    spotObj['rect'] = spotRect; spotObj['pos'] = position; spotObj['x'] = x; spotObj['y'] = y;
                    spotObj['piece'] = "empty"
                    if(!skiplines) {
                        var piece = new MyPiece(this.scene, this, this.curID, piece_radius, piece_height, position, matArr[piecesSpawn], matArr[piecesSpawn+2], piecesSpawn);
                        curPiece++;
                        this.pieces[this.curID] = piece;
                        spotObj['piece'] = this.curID;
                        this.pieceInSpots[this.curID] = this.curID+1;
                        this.curID++;
                    }
                    this.spots[this.curID] = spotObj;
                    this.locationSpots[x][y] = this.curID;
                    this.curID++;
                }
                spawnpiece = !spawnpiece;
            }
            spawnpiece = !spawnpiece;
        }

        this.scene.setPickEnabled(true);
        this.moveList = [];

        this.validPieces = {};
        this.turn = 2;
        this.switchTurn(false);

        this.dead = [0,0];
        this.graveyard = {};


        this.undoID = this.curID++;
        let buttPos = mat4.create();
        buttPos = mat4.translate(buttPos, buttPos, [(size+1)*spot_size, -spot_size, 0]);
        this.undoButton =  new MyButton(this.scene, this, this.undoID, spot_size/2, spot_size/4, buttPos);

        this.filmID = this.curID++;
        let buttPos2 = mat4.create();
        buttPos2 = mat4.translate(buttPos2, buttPos, [0, -spot_size*2, 0]);
        this.filmButton =  new MyButton(this.scene, this, this.filmID, spot_size/2, spot_size/4, buttPos2);

        this.playingDemo = false;
    }

    getNewID() {
        return this.curID + 1;
    }

    playDemo() {
        if(this.moveList.length < 1)
            return;
        this.movieList = [...this.moveList].reverse();
        while(this.moveList.length > 0)
            this.undoMove();
        this.playingDemo = true;
        var t = this;
        this.interval = setInterval(function() {t.playInstance();}, 500);
    }

    playInstance() {
        console.log(this.movieList);
        if(this.movieList.length > 0) {
            const move = this.movieList.pop();
            console.log("playing " + move.piece + " to " + move.spot);
            this.doMove(move.piece, move.playedspot, 0.5, 0.5);
        } else {
            clearInterval(this.interval);
            this.playingDemo = false;
        }
    }

    updateAnimations(t) {
        for(const piece in this.pieces) {
            this.pieces[piece].updateAnimations(t);
        }
        for(const piece in this.graveyard) {
            this.graveyard[piece].updateAnimations(t);
        }
        this.filmButton.update(t);
        this.undoButton.update(t);
    }

    logPicking()
	{
		if (this.scene.pickMode == false && this.playingDemo != true) {
			// results can only be retrieved when picking mode is false
			if (this.scene.pickResults != null && this.scene.pickResults.length > 0) {
				for (var i=0; i< this.scene.pickResults.length; i++) {
					var obj = this.scene.pickResults[i][0];
					if (obj)
					{
						const customId = this.scene.pickResults[i][1];
                        if(customId == this.undoID) {
                            this.undoMove();
                            this.undoButton.playAnim();
                            continue;
                        }
                        if(customId == this.filmID) {
                            this.playDemo();
                            this.filmButton.playAnim();
                            continue;
                        }
                        let piece = this.pieces[customId];
                        if(piece != null && this.turn == piece.getPlayer() && this.validPieces[customId] != null) {
                            this.selected = customId;
                            continue;
                        }
                        let spot = this.spots[customId]
                        if(spot != null && this.selected != null) {
                            this.doMove(this.selected, parseInt(customId));
                        }
					}
				}
				this.scene.pickResults.splice(0,this.scene.pickResults.length);
			}		
		}
	}

    calcValidMoves(sel_piece) {
        let validMoves = {};
        let notNull = false;
        let notCap = [];
        const spot = this.spots[this.pieceInSpots[sel_piece]];
        const x = spot['x']; const y = spot['y'];
        const offsets = [[-1,-1],[-1,1],[1,-1],[1,1]];
        const king = this.pieces[sel_piece].isKing();
        const player = this.pieces[sel_piece].getPlayer();
        for(let i = 0; i < 4; i++) {
            const mid_x = x + offsets[i][0];
            const mid_y = y + offsets[i][1];

            if(mid_x < 0 || mid_x >= this.size || mid_y < 0 || mid_y >= this.size)
                continue;
            const spot_mid = this.locationSpots[mid_x][mid_y]
            const mid_piece = this.spots[spot_mid]['piece']
            if(mid_piece == "empty" && (king || (player == 1 && offsets[i][1] > 0) || (player == 2 && offsets[i][1] < 0))) {
                notCap.push(spot_mid);
                continue;
            }
            else if(mid_piece == "empty" || this.pieces[mid_piece].getPlayer() == this.turn)
                continue;

            const new_x = x + offsets[i][0]*2;
            const new_y = y + offsets[i][1]*2;
            if(new_x < 0 || new_x >= this.size || new_y < 0 || new_y >= this.size)
                continue;
            const spot_target = this.locationSpots[new_x][new_y];
            if(this.spots[spot_target]['piece'] != "empty")
                continue;
            validMoves[spot_target] = mid_piece;
            notNull = true;
        }
        if(notNull)
            return [true, validMoves];
        for(let i = 0; i < notCap.length; i++) {
            validMoves[notCap[i]] = -1;
        }
        return [false, validMoves];
    }

    //function on switch turn to calc all moves to see if player can cap
    switchTurn(retry, choice) {
        this.validPieces = {};
        let canCap = false;
        if(retry) {
            for(const piece in this.pieces) {
                if(this.pieces[piece].getPlayer() != this.turn)
                    continue;
                const moves = this.calcValidMoves(piece);
                if(moves[0]) {
                    canCap = true;
                    this.validPieces[piece] = moves[1];
                }
            }
            if(canCap)
                return;
        }
        if(choice != null)
            this.turn = choice;
        else if(this.turn == 1)
            this.turn = 2;
        else 
            this.turn = 1;
        let movePieces = {};
        for(const piece in this.pieces) {
            if(this.pieces[piece].getPlayer() != this.turn)
                continue;
            const moves = this.calcValidMoves(piece);
            if(moves[0]) {
                canCap = true;
                this.validPieces[piece] = moves[1];
            } else if (Object.keys(moves[1]).length) {
                movePieces[piece] = moves[1];
            }
        }
        if(!canCap)
            this.validPieces = movePieces;
        console.log(this.validPieces);
    }

    doMove(piece, spot, movespeed = 1, capspeed = 2) {
        this.selected = null;
        const res = this.validPieces[piece][spot];

        if(res != null) {
            let move = {
                turn: this.turn,
                piece: piece,
                spot: this.pieceInSpots[piece],
                capspot: -1,
                cappiece: res,
                playedspot: spot,
                madeking: false
            }
            this.spots[spot]['piece'] = piece;
            this.spots[this.pieceInSpots[piece]]['piece'] = "empty";
            this.pieceInSpots[piece] = spot;
            this.pieces[piece].move(this.spots[spot]['pos'], movespeed);
            if(res != -1) {
                this.graveyard[res] = this.pieces[res];
                delete this.pieces[res];
                this.spots[this.pieceInSpots[res]]['piece'] = "empty";
                move.capspot = this.pieceInSpots[res];
                delete this.pieceInSpots[res];
                this.capturePiece(this.graveyard[res], capspeed);
            }
            
            if((this.turn == 1 && this.spots[spot]['y'] == this.size-1) || (this.turn == 2 && this.spots[spot]['y'] == 0)) {
                this.pieces[piece].makeKing(true);
                move.madeking = true;
            }

            this.moveList.push(move);

            this.switchTurn(res != -1);
        }
    }

    undoMove() {
        const move = this.moveList.pop();
        if(move == null)
            return;

        let piece = this.pieces[move.piece];
        piece.makeKing(move.madeking);
        piece.move(this.spots[move.spot].pos, 0.5);
        this.spots[this.pieceInSpots[move.piece]].piece = "empty";
        this.pieceInSpots[move.piece] = move.spot;
        this.spots[move.spot].piece = move.piece;

        if(move.cappiece != -1) {
            let piece = this.graveyard[move.cappiece];
            this.dead[piece.getPlayer()-1] -= 1;
            this.pieces[move.cappiece] = piece;
            delete this.graveyard[move.cappiece]
            piece.unCapture(this.spots[move.capspot].pos, 0.5);
            this.pieceInSpots[move.cappiece] = move.capspot;
            this.spots[move.capspot].piece = move.cappiece;
        }

        this.switchTurn(false, move.turn);
    }

    capturePiece(piece, speed = 2) {
        let gravePosition = mat4.create();
        let dead = this.dead[piece.getPlayer()-1];
        this.dead[piece.getPlayer()-1] += 1;
        let mirror = 1;
        let x_move = 1;
        let y_move = 0;
        if(piece.getPlayer()==1) {
            mirror = -1;
            y_move = 1;
        }
        else
            x_move = this.size
        let x_offset = 0.2*(Math.random()-0.5) * this.piece_radius;
        let y_offset = 0.2*(Math.random()-0.5) * this.piece_radius;
        gravePosition = mat4.translate(gravePosition, gravePosition, [(x_move+1)*this.spot_size*mirror + x_offset, -(this.size/2 - y_move)*this.spot_size + y_offset, dead*this.piece_height]);
        piece.capture(gravePosition, speed);
    }

    display() {
        this.logPicking();
        this.scene.clearPickRegistration();

        for(const piece in this.pieces) {
            this.pieces[piece].display(piece == this.selected);
        }

        for(const piece in this.graveyard) {
            this.graveyard[piece].display(false);
        }

        for(const spot in this.spots) {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.spots[spot]['pos']);
            this.scene.registerForPick(spot, this.spots[spot]['rect']);
            this.spots[spot]['rect'].display();
            this.scene.popMatrix();
        }

        this.undoButton.display();
        this.filmButton.display();
    }
}