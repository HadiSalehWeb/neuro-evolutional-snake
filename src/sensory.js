'use strict';

class Sensory {
    constructor() {
        this.variableCount = 15;
    }
    raycast(headPosition, directions, environment) {
        let pos = headPosition, pixel;
        // const distancePerStep = Math.pow(directions.length, 1 / directions.length);
        let distance = 0;

        do {
            pos = directions.reduce((a, c) => c.moveVector(a), pos);
            pixel = environment.getPixel(pos);
            distance += 1;//distancePerStep;
        } while (pixel === PixelState.Empty);
        // const dirVec = directions.reduce((a, c) => a.add(c.toVector().abs()), Vector2.zero).normalize();
        const scaledDistance = distance / environment.size.x;

        return [
            pixel === PixelState.Wall ? scaledDistance : 0,
            pixel === PixelState.Snake ? scaledDistance : 0,
            pixel === PixelState.Food ? scaledDistance : 0
        ];
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
        new Sensory().raycast(Vector2.zero, [Direction.up], { getPixel: () => PixelState.Wall, size: Vector2.one }).toString() ===
        [1, 0, 0].toString()
    );
    console.assert(
        new Sensory().raycast(Vector2.zero, [Direction.up], { getPixel: () => PixelState.Snake, size: Vector2.one }).toString() ===
        [0, 1, 0].toString()
    );
    console.assert(
        new Sensory().raycast(Vector2.zero, [Direction.up], { getPixel: () => PixelState.Food, size: Vector2.one }).toString() ===
        [0, 0, 1].toString()
    );

    class GridTestEnvironment {
        constructor(arr) {
            this.arr = arr;
            this.getPixel = ({ x, y }) => arr[x][y];
            this.size = new Vector2(arr.length, arr[0].length);
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
        [0, 0, 2 / 5].toString()
    );

    console.assert(
        new Sensory().raycast(Vector2.one, [Direction.up], new GridTestEnvironment([
            [1, 1, 1, 1, 1],
            [1, 2, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 3, 0, 0, 1],
            [1, 1, 1, 1, 1]
        ])).toString() ===
        [3 / 5, 0, 0].toString()
    );

    console.assert(
        new Sensory().raycast(Vector2.one, [Direction.right, Direction.up], new GridTestEnvironment([
            [1, 1, 1, 1, 1],
            [1, 2, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 3, 0, 2, 1],
            [1, 1, 1, 1, 1]
        ])).toString() ===
        [0, 2 / 5, 0].toString()
    );

    console.assert(
        new Sensory().perceive(new GridTestEnvironment([
            [1, 1, 1, 1, 1],
            [1, 2, 0, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 3, 0, 2, 1],
            [1, 1, 1, 1, 1]
        ]), Vector2.one, Direction.up).toString() ===
        [1 / 5, 0, 0, 1 / 5, 0, 0, 3 / 5, 0, 0, 0, 2 / 5, 0, 0, 0, 2 / 5].toString()
    );

    console.log("Sensory tests passed.");
});