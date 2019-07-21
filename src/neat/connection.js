'use strict';

if (!window.Neat) window.Neat = {};

Neat.Connection = class {
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
    weightedInput() {
        return this.enabled ? this.weight * this.inNode.getValue() : 0;
    }
};