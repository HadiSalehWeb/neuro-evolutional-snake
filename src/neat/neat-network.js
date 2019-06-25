'use strict';

class NeatNode {
    constructor(id, isBias = false) {
        this.id = id;
        this.isBias = isBias;
    }
}

class NeatConnection {
    constructor(inNode, outNode, weight, historicalMarking, enabled) {
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
    }
    feedforward(input) {
            
    }
    static fullyConnected(topology, startHistoricalMarking = 0) {
        const nodeCountBeforeLayer = topology.reduce((a, c) => a.concat(a[a.length - 1] + c + 1), [0]);

        return new NeatNetwork(
            range(topology[0] + 1).map(i => new NeatNode(i, i === topology[0])),
            range(topology[topology.length - 1]).map(i => new NeatNode(nodeCountBeforeLayer[topology.length - 1] + i)),
            flatten(
                range(topology.length - 2).map(l =>
                    range(topology[l + 1] + 1).map(j => new NeatNode(nodeCountBeforeLayer[l + 1] + j, j === topology[l + 1]))
                )
            ),
            flatten(
                range(topology.length - 1).map((_, l) =>
                    range(topology[l + 1]).map(i =>
                        range(topology[l] + 1).map(j =>
                            new NeatConnection(
                                nodeCountBeforeLayer[l] + j,
                                nodeCountBeforeLayer[l + 1] + i,
                                Math.random() * 2 - 1,
                                startHistoricalMarking++,
                                true
                            )
                        )
                    )
                )
            )
        );
    }
    static minimal(input, output, startHistoricalMarking = 0) {
        return NeatNetwork.fullyConnected([input, output], startHistoricalMarking);
    }
}