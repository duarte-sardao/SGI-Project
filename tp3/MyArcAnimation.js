import { MyAnimation } from "./MyAnimation.js"

export class MyArcAnimation extends MyAnimation{
    constructor(scene, origin, target, length, arc_peak, arc_height, delay = 0) {
        super(scene);
        this.origin = mat4.clone(origin);
        this.move = mat4.create();
        this.length = length;
        this.arc_peak = arc_peak;
        this.arc_height = arc_height;
        this.matrix = mat4.clone(origin);
        this.done = false;
        this.delay = delay;

        for(let i = 0; i < 16; i++) {
            this.move[i] = target[i]-this.origin[i];
        }
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
        let timeSince = t - this.start;
        if(timeSince < this.delay)
            return;

        
        let prog = timeSince / this.length;

        let arc;
        if(prog < this.arc_peak)
            arc = prog / this.arc_peak;
        else
            arc = (1-prog) / (1-this.arc_peak);

        console.log(arc)

        arc = arc * (Math.PI/2);
        arc = Math.sin(arc)*this.arc_height;

        console.log(arc);

        if(prog > 1) {
            prog = 1;
            arc = 0;
            this.done = true;
        }

        for(let i = 0; i < 16; i++) {
            const a = this.origin[i];
            const b = this.move[i];
            this.matrix[i] = a+(b*prog);
        }

        this.matrix = mat4.translate(this.matrix, this.matrix, [0,0,arc]);
    };
}