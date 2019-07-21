'use strict';

if (!window.Neat) window.Neat = {};

Neat.Genome = class {
    constructor(genes, fitness) {
        this.genes = genes;
        this.fitness = fitness;
    }
    decode() {
        const nodes = [];

        const inputNodes = unique(
            this.genes.filter(g => g.inNodeType === Neat.Node.Type.Input),
            g => g.inNodeId
        ).map(g => new Neat.Node(g.inNodeId, g.inNodeType, g.inNodeActivation));

        nodes.push(...inputNodes);

        const outputNodes = unique(
            this.genes.filter(g1 => !this.genes.some(g2 => g2.inNodeId === g1.outNodeId)),
            g => g.outNodeId
        ).map(g => new Neat.Node(g.outNodeId, g.outNodeType, g.outNodeActivation));

        nodes.push(...outputNodes);

        const hiddenNodes = unique(
            this.genes.filter(g => !nodes.some(n => n.id === g.inNodeId)),
            g => g.inNodeId
        ).map(g => new Neat.Node(g.inNodeId, g.inNodeType, g.inNodeActivation));

        nodes.push(...hiddenNodes);

        const connections = [];

        for (let gene of this.genes) {
            const outNode = nodes.find(n => n.id === gene.outNodeId);
            const connection = new Neat.Connection(nodes.find(n => n.id === gene.inNodeId), outNode, gene.weight, gene.innovation, gene.enabled);
            connections.push(connection);
            outNode.connections.push(connection);
        }

        return new Neat.Network(inputNodes, outputNodes, hiddenNodes, connections);
    }
    crossover(genome) {
        let genes1 = this.genes, genes2 = genome.genes,
            fitness1 = this.fitness, fitness2 = genome.fitness,
            i1 = 0, i2 = 0, iOffspring = 0, offspring = [];

        while (i1 < genes1.length || i2 < genes2.length) {
            if (i2 >= genes2.length || genes1[i1].innovation < genes2[i2].innovation) {
                if (fitness1 > fitness2 || (fitness1 === fitness2 && Math.random() < .5))
                    offspring[iOffspring++] = genes1[i1];
                i1++;
            } else if (i1 >= genes1.length || genes2[i2].innovation < genes1[i1].innovation) {
                if (fitness2 > fitness1 || (fitness1 === fitness2 && Math.random() < .5))
                    offspring[iOffspring++] = genes2[i2];
                i2++;
            } else if (genes1[i1].innovation === genes2[i2].innovation) {
                offspring[iOffspring++] = Math.random() < .5 ? genes1[i1] : genes2[i2];
                i1++;
                i2++;
            }
        }

        return offspring;
    }
    mutateSplit(geneIndex, innovation1, innovation2) {
        const nextNodeId = Math.max(...flatten(this.genes.map(g => [g.inNodeId, g.outNodeId]))) + 1;
        const gene = this.genes[geneIndex];
        gene.enabled = false;
        this.genes.push(new Neat.Gene(
            gene.inNodeId, gene.inNodeType, gene.inNodeActivation,
            nextNodeId, Neat.Node.Type.Inner, gene.inNodeId.activation,
            1, innovation1, true));
        this.genes.push(new Neat.Gene(
            nextNodeId, Neat.Node.Type.Inner, gene.inNodeId.activation,
            gene.outNodeId, gene.outNodeType, gene.outNodeActivation,
            gene.weight, innovation2, true));
    }
    mutateConnect(srcNodeId, distNodeId, innovation) {
        const inEx = this.genes.find(g => g.inNodeId === srcNodeId),
            outEx = this.genes.find(g => g.outNodeId === distNodeId);
        this.genes.push(new Neat.Gene(
            srcNodeId, inEx.inNodeType, inEx.activation,
            distNodeId, outEx.outNodeType, outEx.outNodeActivation,
            randomNormal(0, 1), innovation, true));//TODORANDOMWEIGHTS
    }
};