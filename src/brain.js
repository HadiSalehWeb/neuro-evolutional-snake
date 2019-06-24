'use strict';

const Decision = {
    None: 0,
    RotateClockwise: 1,
    RotateCounterClockwise: 2
};

class Brain {
    constructor(sensory, network) {
        this.sensory = sensory instanceof Sensory ? sensory : new Sensory();
        this.network = network instanceof NeuralNetwork ? network : new NeuralNetwork();
    }
    nextDecision(environment, snake) {
        return [Decision.None, Decision.RotateClockwise, Decision.RotateCounterClockwise][argmax(this.network.feedforward(this.sensory.perceive(environment, snake.head, snake.direction)))];
    }
}


if (!window.tests) window.tests = [];

window.tests.push(function () {
    class GridTestEnvironment {
        constructor(arr) {
            this.arr = arr;
            this.getPixel = ({ x, y }) => arr[x][y];
        }
    }

    console.assert(new Brain(new Sensory(), new NeuralNetwork([15, 3], [
        [
            [1, 1, -1, 1, 1, -1, -1, -1, 1, 1, 1, -1, 1, 1, -1, 0],
            [1, 1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 0],
            [-1, -1, 1, 1, 1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1, 0]
        ]
    ])).nextDecision(new GridTestEnvironment([
        [1, 1, 1, 1, 1],
        [1, 2, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 3, 0, 0, 1],
        [1, 1, 1, 1, 1]
    ]), {
            head: Vector2.one,
            direction: Direction.up
        }) === Decision.RotateClockwise);

    console.log("Brain tests passed.");
});