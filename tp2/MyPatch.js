import { CGFobject, CGFnurbsSurface, CGFnurbsObject } from '../lib/CGF.js';
/**
* MyPatch
* @constructor

 * @param scene - Reference to scene object
 * @param degreeu - Degree of u curve
 * @param partsu - Divisions along u
 * @param degreev - Degree of v curve
 * @param partsv - Divisions along v
 * @param controlvertexes - Control vertexes for surface
*/
export class MyPatch extends CGFobject {
    constructor(scene, degreeu, partsu, degreev, partsv, controlvertexes)  {
        super(scene);
        let nurbsSurface = new CGFnurbsSurface(degreeu, degreev, controlvertexes);
        this.obj = new CGFnurbsObject(this, partsu, partsv, nurbsSurface);
    }
    display() {
        this.obj.display();
    }
}
