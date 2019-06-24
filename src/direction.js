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
        return this.equals(Direction.fromVector(vector));
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
    static fromVector(vector) {
        return vector.y >= Math.abs(vector.x) ? Direction.up :
            vector.y <= -Math.abs(vector.x) ? Direction.down :
                vector.x > Math.abs(vector.y) ? Direction.right :
                    Direction.left;
    }
    static random() {
        return new Direction(Math.random() < .5, Math.random() < .5);
    }
    static up = new Direction(true, true)
    static right = new Direction(false, true)
    static left = new Direction(true, false)
    static down = new Direction(false, false)
}


if (!window.tests) window.tests = [];

window.tests.push(function () {
    console.assert(Direction.up.clone().equals(Direction.up));
    console.assert(Direction.down.clone().equals(Direction.down));
    console.assert(Direction.left.clone().equals(Direction.left));
    console.assert(Direction.right.clone().equals(Direction.right));

    console.assert(Direction.up.reverse().equals(Direction.down));
    console.assert(Direction.down.reverse().equals(Direction.up));
    console.assert(Direction.left.reverse().equals(Direction.right));
    console.assert(Direction.right.reverse().equals(Direction.left));

    console.assert(Direction.up.rotateClockwise().equals(Direction.right));
    console.assert(Direction.right.rotateClockwise().equals(Direction.down));
    console.assert(Direction.down.rotateClockwise().equals(Direction.left));
    console.assert(Direction.left.rotateClockwise().equals(Direction.up));

    console.assert(Direction.up.rotateCounterClockwise().equals(Direction.left));
    console.assert(Direction.left.rotateCounterClockwise().equals(Direction.down));
    console.assert(Direction.down.rotateCounterClockwise().equals(Direction.right));
    console.assert(Direction.right.rotateCounterClockwise().equals(Direction.up));

    console.assert(Direction.up.moveVector(Vector2.zero).equals(Vector2.up));
    console.assert(Direction.right.moveVector(Vector2.zero).equals(Vector2.right));
    console.assert(Direction.down.moveVector(Vector2.zero).equals(Vector2.down));
    console.assert(Direction.left.moveVector(Vector2.zero).equals(Vector2.left));

    console.assert(Direction.up.moveVector(Vector2.zero, new Vector2(4)).equals(Vector2.up.multiply(4)));
    console.assert(Direction.right.moveVector(Vector2.zero, new Vector2(4)).equals(Vector2.right.multiply(4)));
    console.assert(Direction.down.moveVector(Vector2.zero, new Vector2(4)).equals(Vector2.down.multiply(4)));
    console.assert(Direction.left.moveVector(Vector2.zero, new Vector2(4)).equals(Vector2.left.multiply(4)));

    console.assert(Direction.up.moveVector(Vector2.one).equals(new Vector2(1, 2)));
    console.assert(Direction.right.moveVector(Vector2.one).equals(new Vector2(2, 1)));
    console.assert(Direction.down.moveVector(Vector2.one).equals(new Vector2(1, 0)));
    console.assert(Direction.left.moveVector(Vector2.one).equals(new Vector2(0, 1)));

    console.assert(Direction.fromVector(Vector2.up).equals(Direction.up));
    console.assert(Direction.fromVector(Vector2.down).equals(Direction.down));
    console.assert(Direction.fromVector(Vector2.left).equals(Direction.left));
    console.assert(Direction.fromVector(Vector2.right).equals(Direction.right));

    console.assert(Direction.up.pointsTowards(new Vector2(0, 1)));
    console.assert(!Direction.up.pointsTowards(new Vector2(0, -1)));
    console.assert(!Direction.up.pointsTowards(new Vector2(10, 1)));
    console.assert(!Direction.up.pointsTowards(new Vector2(-10, -1)));

    console.assert(!Direction.down.pointsTowards(new Vector2(0, 1)));
    console.assert(Direction.down.pointsTowards(new Vector2(0, -1)));
    console.assert(Direction.right.pointsTowards(new Vector2(10, 1)));
    console.assert(Direction.left.pointsTowards(new Vector2(-10, -1)));

    console.log("Direction tests passed.");
});