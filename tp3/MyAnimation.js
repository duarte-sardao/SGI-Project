export class MyAnimation{
    constructor(scene) {
        if (this.constructor == MyAnimation) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.scene = scene;
        this.matrix = mat4.create();
    }

    update(t) {
        throw new Error("Method 'update(t)' must be implemented.");
    };

    apply() {
        this.scene.multMatrix(this.matrix);
    }
}