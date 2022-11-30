import { MyAnimation } from "./MyAnimation.js"

export class MyArcAnimation extends MyAnimation{
    constructor(scene, origin, target, length, arc_peak, arc_height) {
        super(scene);
        this.origin = origin;
        this.target = target;
        this.length = length;
        this.arc_peak = arc_peak;
        this.arc_height = arc_height;
        this.matrix = this.origin;
        this.done = false;
    }

    getMatrix() {
        return this.matrix;
    }

    getDone() {
        return this.done;
    }

    update(t) {
        if(this.start == null) {
            this.start = t;
            this.end = this.start + this.length;
            this.end_length = this.end - this.arc_peak;
        }
        let prog = (t - this.start) / this.length;

        let orgscaled = mat4.create();
        orgscaled = mat4.multiplyScalar(orgscaled, this.origin, prog);
        let targscaled = mat4.create();
        targscaled = mat4.multiplyScalar(targscaled, this.target, prog);
        this.matrix = mat4.add(this.matrix, orgscaled, targscaled);

        let arc;
        if(t < this.arc_peak)
            arc = (t - this.start) / this.arc_peak;
        else
            arc = (this.end - t) / this.end_length;

        arc = arc * (Math.PI/2);
        arc = Math.sin(arc)*this.arc_height;

        this.matrix = mat4.translate(this.matrix, this.matrix, [0,arc,0])
    };
}