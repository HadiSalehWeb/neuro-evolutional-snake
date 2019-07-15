'use strict';

// Todo: incorporate enabled

const Neat = {
    Node: class {
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
    },
    Connection: class {
        /**
         * @param {Neat.Node} inNode The connection's source node.
         * @param {Neat.Node} outNode The connection's destination node.
         * @param {Number} weight
         * @param {Number} innovation
         * @param {Boolean} [enabled=true]
         */
        constructor(inNode, outNode, weight, innovation, enabled = true) {
            this.inNode = inNode;
            this.outNode = outNode;
            this.weight = weight;
            this.innovation = innovation;
            this.enabled = enabled;
        }
        disable() {
            this.enabled = false;
        }
        enable() {
            this.enable = true;
        }
        weightedInput() {
            return this.enabled ? this.weight * this.inNode.getValue() : 0;
        }
    },
    Gene: class {
        constructor(inNodeId, inNodeType, inNodeActivation, outNodeId, outNodeType, outNodeActivation, weight, innovation, enabled) {
            this.inNodeId = inNodeId;
            this.inNodeType = inNodeType;
            this.inNodeActivation = inNodeActivation;
            this.outNodeId = outNodeId;
            this.outNodeType = outNodeType;
            this.outNodeActivation = outNodeActivation;
            this.weight = weight;
            this.innovation = innovation;
            this.enabled = enabled;
        }
        fromConnection(connection) {
            return new Neat.Gene(
                connection.inNode.id, connection.inNode.type, connection.inNode.activation,
                connection.outNode.id, connection.outNode.type, connection.outNode.activation,
                connection.weight, connection.innovation, connection.enable
            );
        }
    },
    Network: class {
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
        encode() {
            return this.connections.map(c = Neat.Gene.fromConnection(c));
        }
        static decode(genome) {
            const nodes = [];

            const inputNodes = unique(
                genome.filter(g => g.inNodeType === Neat.Node.Type.Input),
                g => g.inNodeId
            ).map(g => new Neat.Node(g.inNodeId, g.inNodeType, g.inNodeActivation));

            nodes.push(...inputNodes);

            const outputNodes = unique(
                genome.filter(g1 => !genome.some(g2 => g2.inNodeId === g1.outNodeId)),
                g => g.outNodeId
            ).map(g => new Neat.Node(g.outNodeId, g.inNodeType, g.inNodeActivation));

            nodes.push(...outputNodes);

            const hiddenNodes = unique(
                genome.filter(g => !nodes.some(n => n.id === g.outNodeId)),
                g => g.outNodeId
            ).map(g => new Neat.Node(g.inNodeId, g.inNodeType, g.inNodeActivation));

            nodes.push(...hiddenNodes);

            const connections = [];

            for (let gene of genome) {
                const outNode = nodes.find(n => n.id === gene.outNodeId);
                const connection = new Neat.Connection(nodes.find(n => n.id === gene.inNodeId), outNode, gene.weight, gene.innovation, gene.enabled);
                connections.push(connection);
                outNode.connections.push(connection);
            }

            return new Neat.Network(inputNodes, outputNodes, hiddenNodes, connections);
        }
        static crossover(g1, g2) {

        }
        static mutateSplit(genome, geneIndex, innovation) {
            const nextNodeId = Math.max(...flatten(genome.map(g => [g.inNodeId, g.outNodeId]))) + 1;
            const gene = genome[geneIndex];
            gene.disable();
            genome.push(new Neat.Gene(
                gene.inNodeId, gene.inNodeType, gene.inNodeActivation,
                nextNodeId, Neat.Node.Type.Inner, gene.inNodeId.activation,
                1, innovation++, true));
            genome.push(new Neat.Gene(
                nextNodeId, Neat.Node.Type.Inner, gene.inNodeId.activation,
                gene.outNodeId, gene.outNodeType, gene.outNodeActivation,
                gene.weight, innovation++, true));
        }
        static mutateConnect(genome, srcNodeId, distNodeId, innovation) {
            const inEx = genome.find(g => g.inNodeId === srcNodeId),
                outEx = genome.find(g => g.outNodeId === distNodeId);
            genome.push(new Neat.Gene(
                srcNodeId, inEx.inNodeType, inEx.activation,
                distNodeId, outEx.outNodeType, outEx.outNodeActivation,
                TODORANDOMWEIGHTS, innovation, true));
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
        static minimal(input, output, startInnovation = 0) {
            return Neat.Network.fullyConnected([input, output], startInnovation);
        }
    },
    Innovation: {
        AddNode: class {
            constructor(connectionInnovation) {
                this.connectionInnovation = connectionInnovation;
            }
            equals(innovation) {
                return innovation instanceof Neat.Innovation.AddNode && innovation.connectionInnovation === connectionInnovation;
            }
        },
        AddConnection: class {
            constructor(srcId, distId) {
                this.srcId = srcId;
                this.distId = distId;
            }
            equals(innovation) {
                return innovation instanceof Neat.Innovation.AddConnection &&
                    innovation.srcId === srcId &&
                    innovation.distId === distId;
            }
        }
    },
    Algorithm: class {
        constructor() {

        }
    }
}