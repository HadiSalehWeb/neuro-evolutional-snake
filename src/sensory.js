'use strict';

class Sensory {
    constructor() {
        this.variableCount = 15;
    }
    raycast(headPosition, directions, environment) {
        let pos = headPosition, pixel;
        do {
            pos = directions.reduce((a, c) => c.moveVector(a), pos);
            pixel = environment.getPixel(pos);
        } while (pixel === PixelState.Empty);
        return [Number(pixel === PixelState.Wall), Number(pixel === PixelState.Snake), Number(pixel === PixelState.Food)];
    }
    perceive(environment, headPosition, headDireciton) {
        const ret = [];

        ret.push(...this.raycast(headPosition, [headDireciton.rotateCounterClockwise()], environment));
        ret.push(...this.raycast(headPosition, [headDireciton.rotateCounterClockwise(), headDireciton], environment));
        ret.push(...this.raycast(headPosition, [headDireciton], environment));
        ret.push(...this.raycast(headPosition, [headDireciton, headDireciton.rotateClockwise()], environment));
        ret.push(...this.raycast(headPosition, [headDireciton.rotateClockwise()], environment));

        return ret;
    }
}



if (!window.tests) window.tests = [];

window.tests.push(function () {
    console.assert(
        new Sensory().raycast(Vector2.zero, [Direction.up], { getPixel: () => PixelState.Wall }).toString() ===
        [1, 0, 0].toString()
    );
    console.assert(
        new Sensory().raycast(Vector2.zero, [Direction.up], { getPixel: () => PixelState.Snake }).toString() ===
        [0, 1, 0].toString()
    );
    console.assert(
        new Sensory().raycast(Vector2.zero, [Direction.up], { getPixel: () => PixelState.Food }).toString() ===
        [0, 0, 1].toString()
    );

    class GridTestEnvironment {
        constructor(arr) {
            this.arr = arr;
            this.getPixel = ({ x, y }) => arr[x][y];
        }
    }

    console.assert(
        new Sensory().raycast(Vector2.one, [Direction.right], new GridTestEnvironment([
            [1, 1, 1, 1, 1],
            [1, 2, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 3, 0, 0, 1],
            [1, 1, 1, 1, 1]
        ])).toString() ===
        [0, 0, 1].toString()
    );

    console.assert(
        new Sensory().raycast(Vector2.one, [Direction.up], new GridTestEnvironment([
            [1, 1, 1, 1, 1],
            [1, 2, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 3, 0, 0, 1],
            [1, 1, 1, 1, 1]
        ])).toString() ===
        [1, 0, 0].toString()
    );

    console.assert(
        new Sensory().raycast(Vector2.one, [Direction.right, Direction.up], new GridTestEnvironment([
            [1, 1, 1, 1, 1],
            [1, 2, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 3, 0, 2, 1],
            [1, 1, 1, 1, 1]
        ])).toString() ===
        [0, 1, 0].toString()
    );

    console.assert(
        new Sensory().perceive(new GridTestEnvironment([
            [1, 1, 1, 1, 1],
            [1, 2, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 3, 0, 2, 1],
            [1, 1, 1, 1, 1]
        ]), Vector2.one, Direction.up).toString() ===
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1].toString()
    );

    console.log("Sensory tests passed.");
});