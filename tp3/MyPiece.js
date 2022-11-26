import { MyCylinder } from "./MyCylinder.js"
import { CGFappearance, CGFtexture } from '../lib/CGF.js';

export class MyPiece {
    constructor(scene, board, piece_radius, piece_height, mat, x_offset, y_offset) {
        this.scene = scene;
        this.board = board;
        this.cylinder = new MyCylinder(this.scene, "", piece_radius, piece_radius, piece_height, 10, 1);
        this.position = mat4.create();
        this.position = mat4.translate(this.position, this.position, [x_offset, y_offset, 0]);

        this.appearance = new CGFappearance(this.scene);
        this.appearance.setShininess(mat[0]);
        this.appearance.setEmission(mat[1][0], mat[1][1], mat[1][2], mat[1][3]);
        this.appearance.setAmbient(mat[2][0], mat[2][1], mat[2][2], mat[2][3]);
        this.appearance.setDiffuse(mat[3][0], mat[3][1], mat[3][2], mat[3][3]);
        this.appearance.setSpecular(mat[4][0], mat[4][1], mat[4][2], mat[4][3]);


    }

    updateAnimations(t) {

    }

    display() {
        this.scene.pushMatrix();
        this.scene.multMatrix(this.position);
        this.appearance.apply();

        this.cylinder.display();

        this.scene.popMatrix();
        return;
    }
}