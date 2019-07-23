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
    static fullyConnected(topology, startInnovation = 0) {
        const layers = [range(topology[0]).map(i => new Neat.Node(i, Neat.Node.Type.Input, 0)).concat(new Neat.Node(topology[0], Neat.Node.Type.Bias, 0))];
        const connections = [];
        let nodeId = topology[0] + 1;

        for (let l = 1; l < topology.length; l++) {
            const layer = [];
            for (let n = 0; n < topology[l]; n++) {
                const node = new Neat.Node(nodeId++, l === topology.length - 1 ? Neat.Node.Type.Output : Neat.Node.Type.Inner, l);
                for (let c = 0; c < layers[l - 1].length; c++) {
                    const connection = new Neat.Connection(layers[l - 1][c], node, randomNormal(0, 1), startInnovation++);// Todo: Formalize weight initialization
                    node.connections.push(connection);
                    connections.push(connection);
                }
                layer.push(node);
            }
            layers.push(layer);
        }

        return new Neat.Network(
            init(first(layers)),
            last(layers),
            flatten([middle(layers), last(first(layers))]),
            connections
        );
    }
    static minimal(input, output, startInnovation = 0) {
        return Neat.Network.fullyConnected([input, output], startInnovation);
    }
    static noConnections(input, output) {
        return new Neat.Network(
            range(input).map(i => new Neat.Node(i, Neat.Node.Type.Input, 0)).concat(new Neat.Node(input, Neat.Node.Type.Bias, 0)),
            range(output).map(i => new Neat.Node(input + i + 1, Neat.Node.Type.Output, 1)),
            [],
            []
        );
    }
};