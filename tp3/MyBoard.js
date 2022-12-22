import { CGFappearance, CGFscene, CGFtexture } from "../lib/CGF.js";
import { MyPiece } from "./MyPiece.js"
import { MyRectangle } from "./MyRectangle.js"
import { MyButton } from "./MyButton.js"
import { MyHUD } from "./MyHUD.js"
import { MySwitchingCamera } from "./MySwitchingCamera.js"

export class MyBoard{
    /**
     * Board constructor
     * @param {CGFscene} scene 
     * @param {SceneGraph} graph 
     * @param {String} textid id identifying board
     * @param {int} id first id for picking id ranges 
     * @param {int} size board side size in amount of spots
     * @param {float} piece_radius radius of pieces
     * @param {float} piece_height height of pieces
     * @param {array of arrays} mats materials to use for pieces
     * @param {int} spotlight spotlight that follows playing pieces
     * @param {int} time time for turn timeout 
     * @param {object of mat4s} buttPos obj with positions for 4 buttons
     * @param {CGFtexture} frame frame for ui
     * @param {array} cams list of camera positions to switch around
     * @param {array} caps optional definition of place to put captured pieces
     */
    constructor(scene, graph, textid, id, size, piece_radius, piece_height, mats, spotlight, time, buttPos, frame, cams, caps) {
        this.scene = scene;
        this.graph = graph;
        this.size = size;
        this.piece_height = piece_height;
        this.piece_radius = piece_radius;
        this.mats = mats;
        this.pieces = {};
        this.spots = {};
        this.pieceInSpots = {};
        this.initID = id;
        this.curID = id;
        this.locationSpots = [...Array(size)].map(_=>Array(size).fill(0));
        this.time = time;
        this.capbase = caps;

        this.camera = new MySwitchingCamera(scene, this, graph, cams, textid);

        this.hud = new MyHUD(scene, this, frame, Math.min(10, Math.round(time/2)));
        this.scene.addRemQueue(spotlight);

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

        this.app_spot = new CGFappearance(this.scene);
        this.app_spot.setEmission(0.45, 0.3, 0.1, 1);

        let matArr = [null, app1, app2, app1_high, app2_high]

        let spawnpiece = false;
        let skiplines = false;
        let piecesSpawn = 1;
        for(let y = 0; y < size; y++){
            if(!skiplines && y == (size / 2)-1)
                skiplines = true;
            if(skiplines && y == (size / 2)+1) {
                piecesSpawn = 2;
                skiplines = false;
            }
            for(let x = 0; x < size; x++) {
                let position = mat4.create();
                position = mat4.translate(position, position, [x, -y, 0]);
                if(spawnpiece) {
                    let spotRect = new MyRectangle(this.scene, "", -1/2, 1/2, - 1/2, 1/2);
                    let spotObj = {}
                    spotObj['rect'] = spotRect; spotObj['pos'] = position; spotObj['x'] = x; spotObj['y'] = y;
                    spotObj['piece'] = "empty"
                    if(!skiplines) {
                        var piece = new MyPiece(this.scene, this, this.curID, piece_radius, piece_height, position, matArr[piecesSpawn], matArr[piecesSpawn+2], piecesSpawn, spotlight);
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

        this.dead = [0,0];
        this.graveyard = {};
        this.winCondition = Object.keys(this.pieces).length / 2;


        this.undoID = this.curID++;
        this.undoButton =  new MyButton(this.scene, this, this.undoID, buttPos["undo_transform"], "back");

        this.filmID = this.curID++;
        this.filmButton =  new MyButton(this.scene, this, this.filmID, buttPos["demo_transform"], "demo");

        this.camID = this.curID++;
        this.camButton =  new MyButton(this.scene, this, this.camID, buttPos["camera_transform"], "cam");

        this.restartID = this.curID++;
        this.restartButton =  new MyButton(this.scene, this, this.restartID, buttPos["restart_transform"], "res");

        this.playingDemo = false;

        this.spotOffset = mat4.create();
        this.spotOffset = mat4.translate(this.spotOffset, this.spotOffset, [0,0,0.001])

        this.gameOver=false;

        this.scene.setPickEnabled(true);
        this.moveList = [];
        this.fakeCaps = [];

        this.validPieces = {};
        this.turn = 2;
        this.switchTurn(false);
    }

    /**
     * Check if a guy id is within the board's picking range.
     * @param {int} val 
     * @returns boolean
     */
    idInRange(val) {
        return val >= this.initID && val <= this.curID;
    }

    /**
     * Gets the id following the range of this board
     * @returns int
     */
    getNewID() {
        return this.curID + 1;
    }

    /**
     * Returns HUD object
     */
    getHUD() {
        return this.hud;
    }

    /**
     * Undoes all moves and resets board to original state.
     */
    restart() {
        while(this.moveList.length > 0)
            this.undoMove();
        
        this.turn = 2;
        this.switchTurn(false);
        this.gameOver = false;
    }

    /**
     * Plays the demo, going over the move list
     * @returns Returns early if theres no moves to play
     */
    playDemo() {
        if(this.moveList.length < 1)
            return;
        this.movieList = [...this.moveList].reverse();
        this.restart();
        this.playingDemo = true;
        var t = this;
        this.interval = setInterval(function() {t.playInstance();}, 1100);
    }

    /**
     * Plays an instance of the demo (a move) and ends the demo if theres no more left.
     */
    playInstance() {
        if(this.movieList.length > 0) {
            const move = this.movieList.pop();
            if(move.fakecapturn != null)
                this.finalfakecap();
            this.doMove(move.piece, move.playedspot, 0.5, 0.5);
        } else {
            clearInterval(this.interval);
            this.playingDemo = false;
        }
    }

    /**
     * Updates animations for all board elements (pieces and buttons)
     * @param {time} t 
     */
    updateAnimations(t) {
        for(const piece in this.pieces) {
            if(this.pieces[piece].updateAnimations(t) && this.spotFollow == piece) {
                this.spotFollow = null;
            }
        }
        for(const piece in this.graveyard) {
            this.graveyard[piece].updateAnimations(t);
        }
        this.filmButton.update(t);
        this.undoButton.update(t);
        this.restartButton.update(t);
        this.camButton.update(t);
        this.camera.update(t);
    }

    /**
     * Given a picking id, proccesses it and executes required action on object
     * @param {int} customId 
     * @returns null
     */
    handleID(customId)
	{
        if(customId == this.camID) {
            this.camera.switch();
            this.camButton.playAnim();
            return;
        }
        if(this.playingDemo)
            return;
        if(customId == this.restartID) {
            this.restart();
            this.restartButton.playAnim();
            return;
        }
        if(customId == this.undoID) {
            this.undoMove();
            this.undoButton.playAnim();
            return;
        }
        if(customId == this.filmID) {
            this.playDemo();
            this.filmButton.playAnim();
            return;
        }
        if(this.gameOver) //we only want to pick buttons if the game is over
            return;
        let piece = this.pieces[customId];
        if(piece != null && this.turn == piece.getPlayer() && this.validPieces[customId] != null) {
            this.selected = customId;
            return;
        }
        let spot = this.spots[customId]
        if(spot != null && this.selected != null) {
            this.doMove(this.selected, parseInt(customId));
        }
	}

    /**
     * Calculates all the move a piece given by id can execute
     * @param {String} sel_piece 
     * @returns [Boolean, Moves object array] with boolean being True if the user can capture a piece
     */
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

    /**
     * Switches a turn, either to the opposite of the current or for given in parameter and checks for loss
     * @param {boolean} retry Wether to attempt to maintain the current turn (if player can capture turn doesn't switch) 
     * @param {int} choice Optional parameter for player to switch to
     * @returns null
     */
    switchTurn(retry, choice) {
        this.turnStart = new Date();
        this.validPieces = {};
        let canCap = false;
        if(this.dead[0] == this.winCondition && !this.gameOver) {
            if(!this.playingDemo)
                alert("Player 2 won!");
            this.gameOver = true;
            return;
        } else if(this.dead[1] == this.winCondition && !this.gameOver) {
            if(!this.playingDemo)
                alert("Player 1 won!");
            this.gameOver = true;
            return;
        }
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
    }

    /**
     * Does a move, checking validity and doing capturing if necessary
     * @param {String} piece moving piece id
     * @param {String} spot target spot id
     * @param {int} movespeed seconds for moving animation
     * @param {int} capspeed seconds for capture animation
     */
    doMove(piece, spot, movespeed = 1, capspeed = 2) {
        this.selected = null;
        this.spotFollow = piece;
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
                move.capspot = this.pieceInSpots[res];
                this.cap(res, capspeed)
            }
            
            if((this.turn == 1 && this.spots[spot]['y'] == this.size-1) || (this.turn == 2 && this.spots[spot]['y'] == 0)) {
                this.pieces[piece].makeKing(true, movespeed);
                move.madeking = true;
            }

            this.moveList.push(move);

           + this.switchTurn(res != -1);
        }
    }

    /**
     * Updates board state on piece capture and calls animation
     * @param {String} res captured piece
     * @param {int} capspeed seconds for capture animation 
     */
    cap(res, capspeed) {
        this.graveyard[res] = this.pieces[res];
        delete this.pieces[res];
        this.spots[this.pieceInSpots[res]]['piece'] = "empty";
        delete this.pieceInSpots[res];
        this.capturePiece(this.graveyard[res], capspeed);
    }

    /**
     * Visually updates piece to be captured, calculating position to target and calling animation on it 
     * @param {String} piece captured piece
     * @param {int} speed seconds for capture animation
     */
    capturePiece(piece, speed = 2) {
        let gravePosition = mat4.create();
        const pl = piece.getPlayer()-1;
        let dead = this.dead[pl];
        this.dead[pl] += 1;
        this.updateHudScoring(pl);


        if(this.capbase[pl] == null) {
            let mirror = 1;
            let x_move = 1;
            let y_move = 0;
            if(piece.getPlayer()==1) {
                mirror = -1;
                y_move = 1;
            }
            else
                x_move = this.size
            let x_offset = 0.3*(Math.random()-0.5) * this.piece_radius;
            let y_offset = 0.3*(Math.random()-0.5) * this.piece_radius;
            gravePosition = mat4.translate(gravePosition, gravePosition, [(x_move+0.75)*mirror + x_offset, -(this.size/2 - y_move+0.5*(-mirror)) + y_offset, 0]);
        } else {
            gravePosition = mat4.copy(gravePosition, this.capbase[pl]);
        }
        gravePosition = mat4.translate(gravePosition, gravePosition, [0,0,dead*this.piece_height]);
        piece.capture(gravePosition, speed);
    }

    /**
     * Updates the score for player x when player y gets a piece captured.
     * @param {Integer} pl int for captured player (used to access dead array so 0 = 1 and 1 = 2) 
     */
    updateHudScoring(pl) {
        let p = pl
        if(pl == 0)
            p = 2
        this.hud.setScore(this.dead[pl],p)
    }

    /**
     * Undoes a move
     */
    undoMove() {
        this.gameOver = false;
        const move = this.moveList.pop();
        if(move == null)
            return;
        else if (move.fakecapturn != null) {
            for(const piece of this.fakeCaps) {
                this.unCapturePiece(this.pieces[piece], this.pieceInSpots[piece]);
            }
    
            this.fakeCaps = [];
            this.switchTurn(false,move.fakecapturn);
            return;
        }


        let piece = this.pieces[move.piece];
        if(move.madeking)
            piece.makeKing(false, 0.5);
        piece.move(this.spots[move.spot].pos, 0.5);
        this.spots[this.pieceInSpots[move.piece]].piece = "empty";
        this.pieceInSpots[move.piece] = move.spot;
        this.spots[move.spot].piece = move.piece;

        if(move.cappiece != -1) {
            this.unCap(move.cappiece, move.capspot)
        }

        this.switchTurn(false, move.turn);
    }

    /**
     * Undoes a captured piece, restoring board state and then calling function to visually update
     * @param {String} pieceID piece that was captured
     * @param {String} spotID spot to return to
     */
    unCap(pieceID, spotID) {
        let piece = this.graveyard[pieceID];
        this.pieces[pieceID] = piece;
        delete this.graveyard[pieceID];
        this.unCapturePiece(piece, spotID);    
        this.pieceInSpots[pieceID] = spotID;
        this.spots[spotID].piece = pieceID;
    }

    /**
     * Visually updates a captured piece retorning to previous state
     * @param {MyPiece} piece piece to move
     * @param {String} spotID spot to go to
     */
    unCapturePiece(piece, spotID) {
        this.dead[piece.getPlayer()-1] -= 1;
        this.updateHudScoring(piece.getPlayer()-1);
        piece.unCapture(this.spots[spotID].pos, 0.5);
    }

    /**
     * On turn timeout all pieces of the loser are moved to the graveyard (purely visual as state is maintained and no validity checks are made)
     * The turn is then switched to the other player (the winner)
     */
    finalfakecap() {
        let move = {
            fakecapturn: this.turn
        }
        this.moveList.push(move);
        this.fakeCaps = [];
        for(const piece in this.pieces) {
            if(this.pieces[piece].getPlayer() == this.turn) {
                this.fakeCaps.push(piece);
                this.capturePiece(this.pieces[piece])
            }
        }
        this.gameOver = true;
        this.switchTurn(false);
    }

    /**
     * Checks if current player has timed out their turn and handles loss in such case.
     */
    checkTime() {
        if(this.turnStart == null || this.gameOver)
            return;
        const diff = Math.floor((new Date() - this.turnStart) / 1000);
        this.hud.setTime(this.time-diff);
        if(diff > this.time) {
            this.selected = null;
            let otherP = 2;
            if(this.turn == 2)
                otherP = 1;
            alert("Player " + this.turn + " took too long! Player " + otherP + " wins!");
            this.finalfakecap();
        }
    }

    /**
     * Display the board elements
     */
    display() {
        this.checkTime();
        this.scene.clearPickRegistration();

        for(const piece in this.pieces) {
            this.pieces[piece].display(piece == this.selected && !this.playingDemo && !this.gameOver, 
                Object.keys(this.validPieces).includes(piece) && !this.playingDemo && !this.gameOver,
                this.spotFollow == piece
                );
        }

        for(const piece in this.graveyard) {
            this.graveyard[piece].display(false);
        }

        this.scene.pushMatrix();
        this.scene.multMatrix(this.spotOffset);
        for(const spot in this.spots) {
            this.scene.pushMatrix();
            this.scene.multMatrix(this.spots[spot]['pos']);
            this.scene.registerForPick(spot, this.spots[spot]['rect']);
            if(this.selected != null && Object.keys(this.validPieces[this.selected]).includes(spot) && !this.playingDemo && !this.gameOver) {
                this.app_spot.apply();
                this.spots[spot]['rect'].display();
            }
            this.scene.popMatrix();
        }
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.undoButton.display();
        this.filmButton.display();
        this.camButton.display();
        this.restartButton.display();
        this.scene.popMatrix();
    }
}