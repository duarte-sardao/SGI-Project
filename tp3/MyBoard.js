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
        for(let i = 0; i < 2; i++) {
            if(this.capbase[i] == null) { //default capture, placed around the middle of the board by the sides
                let gravePosition = mat4.create();
                let mirror = 1;
                let x_move = 1;
                let y_move = 0;
                if(i==1) {
                    mirror = -1;
                    y_move = 1;
                }
                else
                    x_move = this.size
                gravePosition = mat4.translate(gravePosition, gravePosition, [(x_move+0.75)*mirror, -(this.size/2 - y_move+0.5*(-mirror)), 0]);
                this.capbase[i] = gravePosition;
            } 
        }

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

        let validspot = false;
        let skiplines = false;
        let piecesSpawn = 1;
        for(let y = 0; y < size; y++){
            if(!skiplines && y == (size / 2)-1) //middle two lines should have no pieces enable skiplines on entering the spot before the middle
                skiplines = true;
            if(skiplines && y == (size / 2)+1) { //and reenable after we leave mid
                piecesSpawn = 2;
                skiplines = false;
            }
            for(let x = 0; x < size; x++) {
                if(validspot) { //valid spot(black)
                    let position = mat4.create();
                    position = mat4.translate(position, position, [x, -y, 0]);
                    let spotRect = new MyRectangle(this.scene, "", -1/2, 1/2, - 1/2, 1/2);
                    let spotObj = {}
                    spotObj['rect'] = spotRect; spotObj['pos'] = position; spotObj['x'] = x; spotObj['y'] = y;
                    spotObj['piece'] = "empty" //save the spot, initially empty
                    if(!skiplines) {//only spawn pieces of were not skipping the 2 middle lines
                        var piece = new MyPiece(this.scene, this, this.curID, piece_radius, piece_height, position, matArr[piecesSpawn], matArr[piecesSpawn+2], piecesSpawn, spotlight);
                        this.pieces[this.curID] = piece; //piece is saved
                        spotObj['piece'] = this.curID; //and spot is informed it contains it
                        this.pieceInSpots[this.curID] = this.curID+1; //and save which spot by id the piece is in
                        this.curID++;
                    }
                    this.spots[this.curID] = spotObj;
                    this.locationSpots[x][y] = this.curID;
                    this.curID++;
                }
                validspot = !validspot; //if last spot was valid, next one isnt and vice versa
            }
            validspot = !validspot; //if switching line, switch too
        }

        this.dead = [0,0]; //dead count for player 1 and 2
        this.graveyard = {}; //captured piece dict
        this.winCondition = Object.keys(this.pieces).length / 2; //game wins when dead pieces for 1 player is half the total pieces (naturally)


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
        this.spotOffset = mat4.translate(this.spotOffset, this.spotOffset, [0,0,0.001]); //spots need tiny offset to be visible above board

        this.gameOver=false;

        this.scene.setPickEnabled(true);
        this.moveList = []; //list of done moves
        this.fakeCaps = []; //list of pieces which were visually captured on a timeout end

        this.validPieces = {}; //calculated on switch turn, dict of pieces and valid moves
        this.turn = 2;
        this.switchTurn(false); //hack to start as 1 and calculate its moves
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
            if(move.fakecapturn != null) //special version of the move objects
                this.finalfakecap();
            this.doMove(move.piece, move.playedspot, 0.5, 0.5);
        } else { //ended
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
            if(this.pieces[piece].updateAnimations(t) && this.spotFollow == piece) { //updates anim; returns true animation has ended, so set spotlight to following null
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
        if(this.playingDemo) //during demo plays only cameras should be allowed
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
        if(piece != null && this.turn == piece.getPlayer() && this.validPieces[customId] != null) {//check validity of selection based on calculated possibilities
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
        const spot = this.spots[this.pieceInSpots[sel_piece]]; //get cur spot
        const x = spot['x']; const y = spot['y']; //get cur pos from spot
        const offsets = [[-1,-1],[-1,1],[1,-1],[1,1]]; //4 directions max
        const king = this.pieces[sel_piece].isKing();
        const player = this.pieces[sel_piece].getPlayer();
        for(let i = 0; i < 4; i++) {
            const mid_x = x + offsets[i][0]; //first check the immediatly adjacent positions (no capturing)
            const mid_y = y + offsets[i][1];

            if(mid_x < 0 || mid_x >= this.size || mid_y < 0 || mid_y >= this.size) //outside board
                continue;
            const spot_mid = this.locationSpots[mid_x][mid_y];//gets spot and piece in it
            const mid_piece = this.spots[spot_mid]['piece'];
            if(mid_piece == "empty" && (king || (player == 1 && offsets[i][1] > 0) || (player == 2 && offsets[i][1] < 0))) {
                notCap.push(spot_mid); //if its empty and we can move there (only forward if not king) its a valid non capturing move
                continue;
            }
            else if(mid_piece == "empty" || this.pieces[mid_piece].getPlayer() == this.turn) //otherwise if its empty but we cant move there or its occupied
                continue; //by one of our pieces, its of no use to us

            const new_x = x + offsets[i][0]*2; //now checks for captures
            const new_y = y + offsets[i][1]*2;
            if(new_x < 0 || new_x >= this.size || new_y < 0 || new_y >= this.size)
                continue;
            const spot_target = this.locationSpots[new_x][new_y];
            if(this.spots[spot_target]['piece'] != "empty") //due to previous checks, we know theres an enemy piece between target, so we just check if its empty
                continue;
            validMoves[spot_target] = mid_piece; //save endangered piece
            notNull = true; //confirmed the presence of captures
        }
        if(notNull) //if theres captures, return true+the captures
            return [true, validMoves];
        for(let i = 0; i < notCap.length; i++) {
            validMoves[notCap[i]] = -1; //-1 signifies no capture on a move
        }
        return [false, validMoves];//no caps, return false+the moves
    }

    /**
     * Switches a turn, either to the opposite of the current or for given in parameter and checks for loss
     * @param {boolean} retry Wether to attempt to maintain the current turn (if player can capture turn doesn't switch) 
     * @param {int} choice Optional parameter for player to switch to
     */
    switchTurn(retry, choice) {
        this.turnStart = new Date();//get date for turn timeout
        this.validPieces = {}; //reset valid piece dict
        let canCap = false;
        if(this.dead[0] == this.winCondition && !this.gameOver) { //check win condition and display appropriate messages
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
        if(retry) { //were checking to see if current player has a cap and if so can play again
            for(const piece in this.pieces) {
                if(this.pieces[piece].getPlayer() != this.turn)
                    continue;
                const moves = this.calcValidMoves(piece);
                if(moves[0]) { //its a cap if different from -1
                    canCap = true;
                    this.validPieces[piece] = moves[1];
                }
            }
            if(canCap) //ok we can capture so we only want those, current player plays again
                return;
        }
        if(choice != null) //switching turn or setting it if choice wasnt given
            this.turn = choice;
        else if(this.turn == 1)
            this.turn = 2;
        else 
            this.turn = 1;
        let movePieces = {}; //maintain a separate dict for non capturing moves
        for(const piece in this.pieces) {
            if(this.pieces[piece].getPlayer() != this.turn)
                continue;
            const moves = this.calcValidMoves(piece);
            if(moves[0]) { //on cap, save it straight to valid pieces
                canCap = true;
                this.validPieces[piece] = moves[1];
            } else if (Object.keys(moves[1]).length) {//on move save it to aux dict
                movePieces[piece] = moves[1];
            }
        }
        if(!canCap)
            this.validPieces = movePieces; //couldnt capture so use non capture moves as valid
    }

    /**
     * Does a move, checking validity and doing capturing if necessary
     * @param {String} piece moving piece id
     * @param {String} spot target spot id
     * @param {int} movespeed seconds for moving animation
     * @param {int} capspeed seconds for capture animation
     */
    doMove(piece, spot, movespeed = 1, capspeed = 2) {
        this.selected = null; //delete selection wether its succesfull or not
        const res = this.validPieces[piece][spot];

        if(res != null) { //valid move
            let move = { //set up obj for logging
                turn: this.turn,
                piece: piece,
                spot: this.pieceInSpots[piece],
                capspot: -1,
                cappiece: res,
                playedspot: spot,
                madeking: false
            }
            this.spots[spot]['piece'] = piece; //update info on spots and pieces in origin and target
            this.spots[this.pieceInSpots[piece]]['piece'] = "empty";
            this.pieceInSpots[piece] = spot;
            this.pieces[piece].move(this.spots[spot]['pos'], movespeed); //init animation
            if(res != -1) { //its a capture if -1, update move and capture the piece
                move.capspot = this.pieceInSpots[res];
                this.cap(res, capspeed)
            }
            
            if((this.turn == 1 && this.spots[spot]['y'] == this.size-1) || (this.turn == 2 && this.spots[spot]['y'] == 0)) { //reached end
                this.pieces[piece].makeKing(true, movespeed);
                move.madeking = true;
            }

            this.moveList.push(move);
            this.spotFollow = piece;
            this.switchTurn(res != -1);//check to see if can keep turn if a capture was made
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
        gravePosition = mat4.copy(gravePosition, this.capbase[pl]);
        let dead = this.dead[pl];
        this.dead[pl] += 1;
        this.updateHudScoring(pl);


        let x_offset = 0.3*(Math.random()-0.5) * this.piece_radius; //give a little randomness to placement
        let y_offset = 0.3*(Math.random()-0.5) * this.piece_radius;
        gravePosition = mat4.translate(gravePosition, gravePosition, [x_offset,y_offset,dead*this.piece_height]); //stack
        piece.capture(gravePosition, speed);//inform piece
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
        this.gameOver = false; //if game was over its not anymore
        const move = this.moveList.pop();
        if(move == null) //no moves to undo
            return;
        else if (move.fakecapturn != null) { //special move, undo the fake capturing of all pieces in the list
            for(const piece of this.fakeCaps) {
                this.unCapturePiece(this.pieces[piece], this.pieceInSpots[piece]);
            }
    
            this.fakeCaps = []; //and empty
            this.switchTurn(false,move.fakecapturn); //switch to the correct turn
            return;
        }


        let piece = this.pieces[move.piece]; //normal move, get values
        if(move.madeking) //undo kinging
            piece.makeKing(false, 0.5);
        piece.move(this.spots[move.spot].pos, 0.5); //move back
        this.spots[this.pieceInSpots[move.piece]].piece = "empty"; //update spot and piece info
        this.pieceInSpots[move.piece] = move.spot;
        this.spots[move.spot].piece = move.piece;

        if(move.cappiece != -1) { //something was captured, update it to
            this.unCap(move.cappiece, move.capspot)
        }

        this.switchTurn(false, move.turn); //switch to correct turn
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
        let move = { //add the special move
            fakecapturn: this.turn
        }
        this.moveList.push(move);
        this.fakeCaps = [];
        for(const piece in this.pieces) {
            if(this.pieces[piece].getPlayer() == this.turn) { //player who timedout
                this.fakeCaps.push(piece);
                this.capturePiece(this.pieces[piece])
            }
        }
        this.gameOver = true;//ends game and switches (basically so current turn = game winner for ui and such)
        this.switchTurn(false);
    }

    /**
     * Checks if current player has timed out their turn and handles loss in such case.
     */
    checkTime() {
        if(this.turnStart == null || this.gameOver)//before init or after game end irrevelant
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
                this.spotFollow == piece);
        }

        for(const piece in this.graveyard) {
            this.graveyard[piece].display(false);
        }

        this.scene.pushMatrix();
        this.scene.multMatrix(this.spotOffset);
        for(const spot in this.spots) { //loops thru spots, checks playables
            if(this.selected != null && Object.keys(this.validPieces[this.selected]).includes(spot) && !this.playingDemo && !this.gameOver) {
                this.scene.pushMatrix();
                this.scene.multMatrix(this.spots[spot]['pos']); //layout spots in their right positions
                this.scene.registerForPick(spot, this.spots[spot]['rect']);
                this.app_spot.apply();
                this.spots[spot]['rect'].display();
                this.scene.popMatrix();
            }
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