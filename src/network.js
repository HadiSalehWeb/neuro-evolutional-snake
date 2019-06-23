'use strict';

class NeuralNetwork {
    constructor(layers, activation, weights) {
        this.layers = layers instanceof Array &&
            layers.length >= 2 &&
            layers.every(i => i >= 1) ? layers : [1, 1];
        this.layerCount = this.layers.length;
        this.activation = activation instanceof Function ? activation : sigmoid;
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
    static decodeNoMeta(layers, chr, activation) {
        const layerCount = layers.length;
        const weights = range(layerCount - 1).map(n => range(layers[n + 1]).map(_ => range(layers[n] + 1)));
        let index = 0;
        for (let c = 0; c < layerCount - 1; c++)
            for (let i = 0; i < layers[c + 1]; i++)
                for (let j = 0; j < layers[c] + 1; j++)
                    weights[c][i][j] = chr[index++];
        return new NeuralNetwork(layers, activation, weights);
    }
    static decode(chr, activation) {
        const layerCount = chr[0];
        const layers = chr.slice(1, layerCount + 1);
        return NeuralNetwork.decodeNoMeta(layers, chr.slice(layerCount + 1), activation);
    }
}







