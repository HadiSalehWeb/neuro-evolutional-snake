'use strict';

if (!window.Neat) window.Neat = {};

Neat.Node = class {
    /**
     * @param {Number} id
     * @param {Number} type Pulled from Neat.Node.Type.
     * @param {Function} [activation=sigmoid] The activation function associated with this node (Number => Number).
     * @param {Neat.Connection[]} [connections=[]] The weighted connections leading to this node.
     */
    constructor(id, type, activation = sigmoid, connections = []) {
        this.id = id;
        this.type = type;
        this.activation = activation;
        this.connections = connections;
        this.hasValue = false;
        this.value = 0;
    }
    setValue(value) {
        if (!this.type === Neat.Node.Type.Input) throw "Only input nodes' values can be set explicitly.";
        this.hasValue = true;
        this.value = value;
    }
    getValue() {
        switch (this.type) {
            case Neat.Node.Type.Bias:
                return 1;
            case Neat.Node.Type.Input:
                if (!this.hasValue) throw 'Input node without a set value encountered.';
                return this.value;
            case Neat.Node.Type.Inner:
                if (!this.hasValue) {
                    this.hasValue = true;
                    this.value = this.activation(this.connections.reduce((a, c) => a + c.weightedInput(), 0));
                }
                return this.value;
            default:
                throw `Invalid node type ${this.type}`;
        }
    }
    resetValue() {
        this.hasValue = false;
    }
    static Type = {
        Input: 0,
        Bias: 1,
        Inner: 2
    }
    toJOSN() {
        return {
            id: this.id,
            type: this.type,
            activation: this.activation
        }
    }
    toString() {
        return `Node(id = ${this.id}, type: ${Object.keys(Neat.Node.Type).find(k => Neat.Node.Type[k] === this.type)}, activation: ${this.activation})`;
    }
}