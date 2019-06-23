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