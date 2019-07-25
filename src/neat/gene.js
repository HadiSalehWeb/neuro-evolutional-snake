'use strict';

if (!window.Neat) window.Neat = {};

Neat.Gene = class {
    /**
     * @param {Number} inId The source node's id.
     * @param {Neat.Node.Type} inType The source node's type.
     * @param {Number} inDepth The source node's depth.
     * @param {Number} outId The destination node's id.
     * @param {Neat.Node.Type} outType The destination node's type.
     * @param {Number} outDepth The destination node's depth.
     * @param {Number} weight
     * @param {Number} innovation
     * @param {Boolean} enabled
     */
    constructor(inId, inType, inDepth, outId, outType, outDepth, weight, innovation, enabled) {
        this.inId = inId;
        this.inType = inType;
        this.inDepth = inDepth;
        this.outId = outId;
        this.outType = outType;
        this.outDepth = outDepth;
        this.weight = weight;
        this.innovation = innovation;
        this.enabled = enabled;
    }
    static fromGene(gene) {
        return new Neat.Gene(gene.inId, gene.inType, gene.inDepth, gene.outId, gene.outType, gene.outDepth, gene.weight, gene.innovation, gene.enabled);
    }
    static fromConnection(connection) {
        return new Neat.Gene(
            connection.inNode.id, connection.inNode.type, connection.inNode.depth,
            connection.outNode.id, connection.outNode.type, connection.outNode.depth,
            connection.weight, connection.innovation, connection.enabled
        );
    }
    toJOSN() {
        return {
            inId: this.inId,
            inType: this.inType,
            inDepth: this.inDepth,
            outId: this.outId,
            outType: this.outType,
            outDepth: this.outDepth,
            weight: this.weight,
            innovation: this.innovation,
            enabled: this.enabled
        }
    }
    toString() {
        return `Gene(inId: ${this.inId}, inType: ${this.inType}, inDepth: ${this.inDepth}, outId: ${this.outId}, outType: ${this.outType}, outDepth: ${this.outDepth}, weight: ${this.weight}, innovation: ${this.innovation}, enabled: ${this.enabled})`;
    }
}


