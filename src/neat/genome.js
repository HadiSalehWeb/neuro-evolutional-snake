'use strict';

if (!window.Neat) window.Neat = {};

Neat.Genome = class {
    constructor(genes, fitness) {
        this.genes = genes;
        this.fitness = fitness;
        for (let gene of genes)
            console.assert(gene.inDepth < gene.outDepth);
    }
    static fromGenome(genome) {
        return new Neat.Genome(genome.genes.map(g => Neat.Gene.fromGene(g)), genome.fitness);
    }
    decode() {
        const inputNodes = unique(
            this.genes.filter(g => g.inType === Neat.Node.Type.Input),
            g => g.inId
        ).map(g => new Neat.Node(g.inId, g.inType, g.inDepth));

        const outputNodes = unique(
            this.genes.filter(g => g.outType === Neat.Node.Type.Output),
            g => g.outId
        ).map(g => new Neat.Node(g.outId, g.outType, g.outDepth));

        const hiddenNodes = unique(
            this.genes.filter(g => g.inType === Neat.Node.Type.Inner || g.inType === Neat.Node.Type.Bias),
            g => g.inId
        ).map(g => new Neat.Node(g.inId, g.inType, g.inDepth));
        hiddenNodes.sort((a, b) => a.depth - b.depth);

        const nodes = [...inputNodes, ...hiddenNodes, ...outputNodes];

        const connections = [];

        for (let gene of this.genes) {
            const out = nodes.find(n => n.id === gene.outId);
            const connection = new Neat.Connection(nodes.find(n => n.id === gene.inId), out, gene.weight, gene.innovation, gene.enabled);
            connections.push(connection);
            out.connections.push(connection);
        }

        return new Neat.Network(inputNodes, outputNodes, hiddenNodes, connections);
    }
    crossover(genome) {
        let genes1 = this.genes, genes2 = genome.genes,
            fitness1 = this.fitness, fitness2 = genome.fitness,
            i1 = 0, i2 = 0, iOffspring = 0, offspringGenes = [];

        while (i1 < genes1.length || i2 < genes2.length) {
            if (i2 >= genes2.length || (i1 < genes1.length && genes1[i1].innovation < genes2[i2].innovation)) {
                if (fitness1 > fitness2 || (fitness1 === fitness2 && Math.random() < .5))
                    offspringGenes[iOffspring++] = genes1[i1];
                i1++;
            } else if (i1 >= genes1.length || genes2[i2].innovation < genes1[i1].innovation) {
                if (fitness2 > fitness1 || (fitness1 === fitness2 && Math.random() < .5))
                    offspringGenes[iOffspring++] = genes2[i2];
                i2++;
            } else if (genes1[i1].innovation === genes2[i2].innovation) /* Practically just an 'else' */ {
                offspringGenes[iOffspring++] = Math.random() < .5 ? genes1[i1] : genes2[i2];
                if ((!genes1[i1].enabled || !genes2[i2].enabled) && Math.random() < .25)
                    offspringGenes[iOffspring - 1].enabled = true;
                i1++;
                i2++;
            }
        }

        const offspring = new Neat.Genome(offspringGenes, -1);

        return offspring;
    }
    mutateSplit(geneIndex, innovation1, innovation2, newNodeId) {
        const gene = this.genes[geneIndex];
        gene.enabled = false;
        const newDepth = gene.inDepth * .5 + gene.outDepth * .5;
        this.genes.push(new Neat.Gene(
            gene.inId, gene.inType, gene.inDepth,
            newNodeId, Neat.Node.Type.Inner, newDepth,
            1, innovation1, true));
        this.genes.push(new Neat.Gene(
            newNodeId, Neat.Node.Type.Inner, newDepth,
            gene.outId, gene.outType, gene.outDepth,
            gene.weight, innovation2, true));
    }
    mutateConnect(inId, outId, innovation) {
        const { inType, inDepth } = this.genes.find(g => g.inId === inId),
            { outType, outDepth } = this.genes.find(g => g.outId === outId);
        this.genes.push(new Neat.Gene(
            inId, inType, inDepth,
            outId, outType, outDepth,
            randomNormal(0, 1), innovation, true));//TODOFORMALIZERANDOMWEIGHTS

        console.assert(inDepth < outDepth);
    }
    toJOSN() {
        return {
            genes: this.genes.map(g => g.toJOSN()),
            fitness: this.fitness
        }
    }
    toString() {
        return `Genome(genes: [${this.genes.map(g => g.toString()).join(', ')}], fitness: ${this.fitness})`;
    }
};