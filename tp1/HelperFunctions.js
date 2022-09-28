export class Helper {
    constructor() {}
    
    crossProduct(vert1, vert2, vert3) {
        var vec1 = [vert2[0]-vert1[0], vert2[1]-vert1[1], vert2[2]-vert1[2]];
        var vec2 = [vert3[0]-vert1[0], vert3[1]-vert1[1], vert3[2]-vert1[2]];
        var cp = [vec1[1]*vec2[2] - vec1[2]*vec2[1], vec1[2]*vec2[0] - vec1[0]*vec2[2], vec1[0]*vec2[1] - vec1[1]*vec2[0]];
        var nsize = Math.sqrt(
            cp[0]*cp[0]+
            cp[1]*cp[1]+
            cp[2]*cp[2]
            );
        cp[0]/=nsize;
        cp[1]/=nsize;
        cp[2]/=nsize;
        return cp;
    }
}