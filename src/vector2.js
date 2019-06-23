'use strict';

class Vector2 {
    constructor(x, y) {
        if (typeof (x) !== typeof (1))
            throw 'Vector2 constructor requires at least one numerical argument.';
        if (typeof (y) !== typeof (1)) {
            this.x = x;
            this.y = x;
        }
        else {
            this.x = x;
            this.y = y;
        }
    }
    toRowVector() {
        return [[this.x, this.y]];
    }
    toColumnVector() {
        return [[this.x], [this.y]];
    }
    toArray() {
        return [this.x, this.y];
    }
    toString() {
        return 'Vector2(' + this.x + ', ' + this.y + ')';
    }
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    substract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }
    negate() {
        return new Vector2(-this.x, -this.y);
    }
    reciprocal() {
        return new Vector2(1 / this.x, 1 / this.y);
    }
    map(func) {
        return new Vector2(func(this.x), func(this.y));
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    sqrMagnitude() {
        return this.dot(this);
    }
    magnitude() {
        return Math.sqrt(this.sqrMagnitude());
    }
    normalize() {
        return this.divide(this.magnitude());
    }
    norm(p) {
        return Math.pow(Math.pow(this.x, p) + Math.pow(this.y, p), 1 / p);
    }
    maximumNorm() {
        return Math.max(this.x, this.y);
    }
    distanceTo(v) {
        return v.substract(this).magnitude();
    }
    lerp(v, t) {
        return this.add(v.substract(this).multiply(t));
    }
    perpendicularTo(v) {
        return this.dot(v) === 0;
    }
    floor() {
        return this.map(Math.floor);
    }
    ceil() {
        return this.map(Math.ceil);
    }
    clone(v) {
        return new Vector2(this.x, this.y);
    }
    equals(v) {
        return this.x === v.x && this.y === v.y;
    }
    hash() {
        return this.x * 31 + this.y;
    }
    static fromRowVector(v) {
        return new Vector2(v[0][0], v[0][1]);
    }
    static fromColumnVector(v) {
        return new Vector2(v[0][0], v[1][0]);
    }
    static fromArray(arr) {
        return new Vector2(arr[0], arr[1]);
    }
    static random(xmin, xmax, ymin, ymax) {
        return new Vector2(xmin + Math.random() * (xmax - xmin), ymin + Math.random() * (ymax - ymin));
    }
    static up = new Vector2(0, 1);
    static down = new Vector2(0, -1);
    static right = new Vector2(1, 0);
    static left = new Vector2(-1, 0);
    static zero = new Vector2(0, 0);
    static one = new Vector2(1, 1);
}

