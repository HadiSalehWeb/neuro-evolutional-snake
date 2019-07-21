'use strict';

if (!window.Neat) window.Neat = {};

Neat.Innovation = {
    AddNode: class {
        constructor(connectionInnovation, newInnovation1, newInnovation2) {
            this.connectionInnovation = connectionInnovation;
            this.newInnovation1 = newInnovation1;
            this.newInnovation2 = newInnovation2;
        }
        equals(innovation) {
            return innovation instanceof Neat.Innovation.AddNode && innovation.connectionInnovation === connectionInnovation;
        }
    },
    AddConnection: class {
        constructor(srcId, distId, newInnovation) {
            this.srcId = srcId;
            this.distId = distId;
            this.newInnovation = newInnovation;
        }
        equals(innovation) {
            return innovation instanceof Neat.Innovation.AddConnection &&
                innovation.srcId === srcId &&
                innovation.distId === distId;
        }
    }
};