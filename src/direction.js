'use strict';

//!b1 && !b2 => down
//!b1 && b2 => right
//b1 && !b2 => left
//b1 && b2 => up
class Direction {
    constructor(b1, b2) {
        if (typeof (b1) !== typeof (true) || typeof (b2) !== typeof (true))
            throw 'Direction constructor requires two boolean arguments.';
        this.b1 = b1;
        this.b2 = b2;
    }
    moveVector(vec, unit) {
        unit = unit instanceof Vector2 ? unit : Vector2.one;
        return new Vector2(
            vec.x + (this.b1 !== this.b2 ? (this.b2 ? 1 : -1) * unit.x : 0),
            vec.y + (this.b1 === this.b2 ? (this.b2 ? 1 : -1) * unit.y : 0)
        );
    }
    pointsTowards(vector) {
        return this.equals(this.fromVector(vector));
    }
    fromVector(vector) {
        return vector.y >= Math.abs(vector.x) ? Direction.up :
            vector.y <= -Math.abs(vector.x) ? Direction.down :
                vector.x > Math.abs(vector.y) ? Direction.right :
                    Direction.left;
    }
    equals(d) {
        return this.b1 === d.b1 && this.b2 === d.b2;
    }
    clone() {
        return new Direction(this.b1, this.b2);
    }
    reverse() {
        return new Direction(!this.b1, !this.b2);
    }
    rotateClockwise() {
        return new Direction(!this.b2, this.b1);
    }
    rotateCounterClockwise() {
        return new Direction(this.b2, !this.b1);
    }
    toString() {
        return this.b1 ? this.b2 ? 'Up' : 'Left' : this.b2 ? 'Right' : 'Down';
    }
    static random() {
        return new Direction(Math.random() < .5, Math.random() < .5);
    }
    static up = new Direction(true, true)
    static right = new Direction(false, true)
    static left = new Direction(true, false)
    static down = new Direction(false, false)
}