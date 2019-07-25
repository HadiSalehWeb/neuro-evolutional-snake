'use strict';

if (!window.Neat) window.Neat = {};

Neat.Innovation = {
    AddNode: class {
        constructor(connectionInnovation, newInnovation1, newInnovation2, newNodeId) {
            this.connectionInnovation = connectionInnovation;
            this.newInnovation1 = newInnovation1;
            this.newInnovation2 = newInnovation2;
            this.newNodeId = newNodeId;
        }
        equals(connectionInnovation) {
            return connectionInnovation === this.connectionInnovation;
        }
    },
    AddConnection: class {
        constructor(inId, outId, newInnovation) {
            this.inId = inId;
            this.outId = outId;
            this.newInnovation = newInnovation;
        }
        equals(inId, outId) {
            return this.inId === inId && this.outId === outId;
        }
    }
};