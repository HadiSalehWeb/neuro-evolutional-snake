'use strict';

class NeatNode {
    /**
     * @param {Number} id Network-specific id. The id's [0...n] must be reserved for the n input nodes.
     * @param {Number} type Pulled from NeatNode.Type.
     * @param {NeatConnection[]} [connections=[]] The weighted connections leading to this node.
     * @param {Function} [activation=sigmoid] The activation function associated with this node (Number => Number).
     */
    constructor(id, type, connections = [], activation = sigmoid) {
        this.id = id;
        this.type = type;
        this.hasValue = false;
        this.value = 0;
        this.connections = connections;
        this.activation = activation;
    }
    setValue(value) {
        if (!this.type === NeatNode.Type.Input) throw 'Only input nodes\' values can be set explicitly.';
        this.hasValue = true;
        this.value = value;
    }
    getValue() {
        switch (this.type) {
            case NeatNode.Type.Bias:
                return 1;
            case NeatNode.Type.Input:
                if (!this.hasValue) throw 'Input node without a set value encountered.';
                return this.value;
            case NeatNode.Type.Inner:
                if (!this.hasValue) {
                    this.hasValue = true;
                    this.value = this.activation(this.connections.reduce((a, c) => a + c.weight * c.inNode.getValue(), 0));
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
}

class NeatConnection {
    /**
     * @param {NeatNode} inNode The connection's source node.
     * @param {NeatNode} outNode The connection's destination node.
     * @param {Number} weight
     * @param {Number} [historicalMarking=0]
     * @param {Boolean} [enabled=true]
     */
    constructor(inNode, outNode, weight, historicalMarking = 0, enabled = true) {
        this.inNode = inNode;
        this.outNode = outNode;
        this.weight = weight;
        this.historicalMarking = historicalMarking;
        this.enabled = enabled;
    }
    disable() {
        this.enabled = false;
    }
    enable() {
        this.enable = true;
    }
}

class NeatNetwork {
    constructor(inputNodes, outputNodes, hiddenNodes, connections) {
        this.inputNodes = inputNodes;
        this.outputNodes = outputNodes;
        this.hiddenNodes = hiddenNodes;
        this.connections = connections;
        this.nextHistoricalMarking = Math.max(...connections.map(x => x.historicalMarking)) + 1;
    }
    feedforward(input) {
        for (let node of [...this.hiddenNodes, ...this.outputNodes])
            node.resetValue();

        for (let i = 0; i < this.inputNodes.length; i++)
            this.inputNodes[i].setValue(input[i]);

        return this.outputNodes.map(node => node.getValue());
    }
    static fullyConnected(topology, startHistoricalMarking = 0, activation = sigmoid) {
        const layers = [range(topology[0]).map(i => new NeatNode(i, NeatNode.Type.Input)).concat(new NeatNode(topology[0], NeatNode.Type.Bias))];
        let nodeCounter = topology[0] + 1;
        const connections = [];

        for (let l = 1; l < topology.length; l++) {
            const layer = [];
            for (let n = 0; n < topology[l]; n++) {
                const node = new NeatNode(nodeCounter++, NeatNode.Type.Inner, [], activation);
                for (let c = 0; c < topology[l - 1] + 1; c++) {
                    const connection = new NeatConnection(layers[l - 1][c], node, Math.random() * 2 - 1, startHistoricalMarking++);//Formalize weight initialization
                    node.connections.push(connection);
                    connections.push(connection);
                }
                layer.push(node);
            }
            if (l !== topology.length - 1)
                layer.push(new NeatNode(nodeCounter++, NeatNode.Type.Bias));
            layers.push(layer);
        }

        return new NeatNetwork(
            init(layers[0]),
            last(layers),
            flatten([middle(layers), last(layers[0])]),
            connections
        );
    }
    static minimal(input, output, startHistoricalMarking = 0) {
        return NeatNetwork.fullyConnected([input, output], startHistoricalMarking);
    }
}