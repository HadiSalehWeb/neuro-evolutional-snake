'use strict';

if (!window.Neat) window.Neat = {};

Neat.Network = class {
    /**
     * @param {Neat.Node[]} inputNodes 
     * @param {Neat.Node[]} outputNodes 
     * @param {Neat.Node[]} hiddenNodes 
     * @param {Neat.Connection[]} connections 
     */
    constructor(inputNodes, outputNodes, hiddenNodes, connections) {
        this.inputNodes = inputNodes;
        this.outputNodes = outputNodes;
        this.hiddenNodes = hiddenNodes;
        this.connections = connections;
    }
    feedforward(input) {
        for (let node of [...this.hiddenNodes, ...this.outputNodes])
            node.resetValue();

        for (let i = 0; i < this.inputNodes.length; i++)
            this.inputNodes[i].setValue(input[i]);

        return this.outputNodes.map(node => node.getValue());
    }
    encode(fitness) {
        return new Neat.Genome(this.connections.map(c => Neat.Gene.fromConnection(c)), fitness);
    }
    static fullyConnected(topology, startInnovation = 0, activation = sigmoid) {
        const layers = [range(topology[0]).map(i => new Neat.Node(i, Neat.Node.Type.Input)).concat(new Neat.Node(topology[0], Neat.Node.Type.Bias))];
        const connections = [];
        let nodeId = topology[0] + 1;

        for (let l = 1; l < topology.length; l++) {
            const layer = [];
            for (let n = 0; n < topology[l]; n++) {
                const node = new Neat.Node(nodeId++, Neat.Node.Type.Inner, activation);
                for (let c = 0; c < topology[l - 1] + 1; c++) {
                    const connection = new Neat.Connection(layers[l - 1][c], node, Math.random() * 2 - 1, startInnovation++);// Todo: Formalize weight initialization
                    node.connections.push(connection);
                    connections.push(connection);
                }
                layer.push(node);
            }
            if (l !== topology.length - 1)
                layer.push(new Neat.Node(nodeId++, Neat.Node.Type.Bias));
            layers.push(layer);
        }

        return new Neat.Network(
            init(layers[0]),
            last(layers),
            flatten([middle(layers), last(layers[0])]),
            connections
        );
    }
    static minimal(input, output, startInnovation = 0, activation = sigmoid) {
        return Neat.Network.fullyConnected([input, output], startInnovation, activation);
    }
    static noConnections(input, output, activation = sigmoid) {
        return new Neat.Network(
            range(input).map(i => new Neat.Node(i, Neat.Node.Type.Input)).concat(new Neat.Node(input, Neat.Node.Type.Bias)),
            range(output).map(i => new Neat.Node(input + i + 1, Neat.Node.Type.Inner, activation)),
            [],
            []
        );
    }
};