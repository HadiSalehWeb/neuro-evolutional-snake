'use strict';

if (!window.Neat) window.Neat = {};

Neat.Gene = class {
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
    static fromConnection(connection) {
        return new Neat.Gene(
            connection.inNode.id, connection.inNode.type, connection.inNode.activation,
            connection.outNode.id, connection.outNode.type, connection.outNode.activation,
            connection.weight, connection.innovation, connection.enabled
        );
    }
}