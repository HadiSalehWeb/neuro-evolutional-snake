'use strict';

class NeuralNetwork {
    constructor(layers, weights) {
        this.layers = layers instanceof Array &&
            layers.length >= 2 &&
            layers.every(i => i >= 1) ? layers : [1, 1];
        this.layerCount = this.layers.length;
        this.activation = sigmoid;
        this.weights = weights instanceof Array &&
            weights.length === this.layerCount - 1 &&
            weights.every((x, i) => x.length === this.layers[i + 1] &&
                x.every(y => y.length === this.layers[i] + 1)) ? weights :
            range(this.layerCount - 1).map(i =>
                range(this.layers[i + 1]).map(_ =>
                    range(this.layers[i] + 1).map(j =>
                        j === this.layers[i] ? 0 : randomNormal(0, 1 / Math.sqrt(this.layers[i]))
                    )
                )
            );
    }
    feedforward(input) {
        return input instanceof Array ? input[0] instanceof Array ?
            this.feedforwardMatrix(input) : this.feedforwardVector(input) : undefined;
    }
    feedforwardMatrix(inputVector) {
        return this.weights.reduce((a, c) => multiply(c, a.concat([[1]])).map(e => [this.activation(e[0])]), inputVector);
    }
    feedforwardVector(inputArray) {
        return this.feedforwardMatrix(inputArray.map(x => [x])).map(x => x[0]);
    }
    equals(net) {
        return this.layerCount === net.layerCount &&
            this.layers.length === net.layers.length &&
            this.layers.reduce((a, c, i) => a && c === net.layers[i], true) &&
            this.weights.length === net.weights.length &&
            this.weights.reduce((a, c, i) => a &&
                c.length === net.weights[i].length &&
                c.reduce((a, c, j) => a &&
                    c.length === net.weights[i][j].length &&
                    c.reduce((a, c, k) => a &&
                        c === net.weights[i][j][k], true), true), true);
    }
    encode(includeMetadata) {
        const ret = includeMetadata ? [this.layerCount, ...this.layers] : [];
        for (let c = 0; c < this.layerCount - 1; c++)
            for (let i = 0; i < this.weights[c].length; i++)
                for (let j = 0; j < this.weights[c][i].length; j++)
                    ret.push(this.weights[c][i][j]);
        return ret;
    }
    static decodeNoMeta(layers, chr) {
        const layerCount = layers.length;
        const weights = range(layerCount - 1).map(n => range(layers[n + 1]).map(_ => range(layers[n] + 1)));
        let index = 0;
        for (let c = 0; c < layerCount - 1; c++)
            for (let i = 0; i < layers[c + 1]; i++)
                for (let j = 0; j < layers[c] + 1; j++)
                    weights[c][i][j] = chr[index++];
        return new NeuralNetwork(layers, weights);
    }
    static decode(chr) {
        const layerCount = chr[0];
        const layers = chr.slice(1, layerCount + 1);
        return NeuralNetwork.decodeNoMeta(layers, chr.slice(layerCount + 1));
    }
}



console.assert(new NeuralNetwork([2, 3, 1], [
    [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ],
    [
        [1, 2, 3, 4]
    ]
]).feedforward([1, 2])[0] ===
    sigmoid(
        1 * sigmoid(1 * 1 + 2 * 2 + 3) +
        2 * sigmoid(1 * 4 + 2 * 5 + 6) +
        3 * sigmoid(1 * 7 + 2 * 8 + 9) +
        4
    )
);

console.assert(new NeuralNetwork([2, 3, 1], [
    [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ],
    [
        [1, 2, 3, 4]
    ]
]).feedforward([[1], [2]])[0][0] ===
    sigmoid(
        1 * sigmoid(1 * 1 + 2 * 2 + 3) +
        2 * sigmoid(1 * 4 + 2 * 5 + 6) +
        3 * sigmoid(1 * 7 + 2 * 8 + 9) +
        4
    )
);

console.assert((net => net.encode(true).toString() === NeuralNetwork.decodeNoMeta([1, 1], net.encode(false)).encode(true).toString())(new NeuralNetwork([1, 1])));
console.assert((net => net.encode(true).toString() === NeuralNetwork.decodeNoMeta([1, 2, 3], net.encode(false)).encode(true).toString())(new NeuralNetwork([1, 2, 3])));
console.assert((net => net.encode(true).toString() === NeuralNetwork.decodeNoMeta([2, 2, 2, 2, 2, 2], net.encode(false)).encode(true).toString())(new NeuralNetwork([2, 2, 2, 2, 2, 2])));
console.assert((net => net.encode(true).toString() === NeuralNetwork.decodeNoMeta([50, 30, 10], net.encode(false)).encode(true).toString())(new NeuralNetwork([50, 30, 10])));

console.assert((net => net.equals(NeuralNetwork.decodeNoMeta([1, 1], net.encode(false))))(new NeuralNetwork([1, 1])));
console.assert((net => net.equals(NeuralNetwork.decodeNoMeta([1, 2, 3], net.encode(false))))(new NeuralNetwork([1, 2, 3])));
console.assert((net => net.equals(NeuralNetwork.decodeNoMeta([2, 2, 2, 2, 2, 2], net.encode(false))))(new NeuralNetwork([2, 2, 2, 2, 2, 2])));
console.assert((net => net.equals(NeuralNetwork.decodeNoMeta([50, 30, 10], net.encode(false))))(new NeuralNetwork([50, 30, 10])));

console.assert((net => net.encode(true).toString() === NeuralNetwork.decode(net.encode(true)).encode(true).toString())(new NeuralNetwork([1, 1])));
console.assert((net => net.encode(true).toString() === NeuralNetwork.decode(net.encode(true)).encode(true).toString())(new NeuralNetwork([1, 2, 3])));
console.assert((net => net.encode(true).toString() === NeuralNetwork.decode(net.encode(true)).encode(true).toString())(new NeuralNetwork([2, 2, 2, 2, 2, 2])));
console.assert((net => net.encode(true).toString() === NeuralNetwork.decode(net.encode(true)).encode(true).toString())(new NeuralNetwork([50, 30, 10])));

console.log("NerualNetwork tests passed.");
