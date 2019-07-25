'use strict';

if (!window.Neat) window.Neat = {};

Neat.Genome = class {
    constructor(genes, fitness) {
        this.genes = genes;
        this.fitness = fitness;
    }
    static fromGenome(genome) {
        return new Neat.Genome(genome.genes.map(g => Neat.Gene.fromGene(g)), genome.fitness);
    }
    decode() {
        const nodes = [];

        const inputNodes = unique(
            this.genes.filter(g => g.inType === Neat.Node.Type.Input),
            g => g.inId
        ).map(g => new Neat.Node(g.inId, g.inType, g.inDepth));

        nodes.push(...inputNodes);

        const outputNodes = unique(
            this.genes.filter(g => g.outType === Neat.Node.Type.Output),
            g => g.outId
        ).map(g => new Neat.Node(g.outId, g.outType, g.inDepth));

        nodes.push(...outputNodes);

        const hiddenNodes = unique(
            this.genes.filter(g => !nodes.some(n => n.id === g.inId)),
            g => g.inId
        ).map(g => new Neat.Node(g.inId, g.inType, g.inDepth));

        nodes.push(...hiddenNodes);

        const connections = [];

        for (let gene of this.genes) {
            const out = nodes.find(n => n.id === gene.outId);
            const connection = new Neat.Connection(nodes.find(n => n.id === gene.inId), out, gene.weight, gene.innovation, gene.enabled);
            connections.push(connection);
            out.connections.push(connection);
        }

        return new Neat.Network(inputNodes, outputNodes, hiddenNodes, connections);
    }
    resolveDepth(gene) {
        // Probably not the most efficient way to do it but fuck it
        gene.outDepth++;

        for (let nextGene of this.genes)
            if (nextGene.inId === gene.outId)
                nextGene.inDepth = gene.outDepth;
            else if (nextGene.outId === gene.outId)
                nextGene.outDepth = gene.outDepth;

        for (let nextGene of this.genes)
            if (nextGene.inId === gene.outId && nextGene.outDepth === gene.outDepth) {
                this.resolveDepth(nextGene);
                return;
            }
    }
    crossover(genome) {
        let genes1 = this.genes, genes2 = genome.genes,
            fitness1 = this.fitness, fitness2 = genome.fitness,
            i1 = 0, i2 = 0, iOffspring = 0, offspringGenes = [];

        while (i1 < genes1.length || i2 < genes2.length) {
            if (i2 >= genes2.length || genes1[i1].innovation < genes2[i2].innovation) {
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
                    offspringGenes[iOffspring].enabled = true;
                i1++;
                i2++;
            }
        }

        const offspring = offspringGenes;

        for (var gene of offspring.genes)
            if (gene.inDepth >= gene.outDepth)
                this.resolveDepth(gene);

        return offspring;
    }
    mutateSplit(geneIndex, innovation1, innovation2, newNodeId = -1) {
        if (newNodeId === -1) newNodeId = Math.max(...flatten(this.genes.map(g => [g.inId, g.outId]))) + 1;
        const gene = this.genes[geneIndex];
        gene.enabled = false;
        this.genes.push(new Neat.Gene(
            gene.inId, gene.inType, gene.inDepth,
            nextNodeId, Neat.Node.Type.Inner, gene.inDepth + 1,
            1, innovation1, true));
        this.genes.push(new Neat.Gene(
            nextNodeId, Neat.Node.Type.Inner, gene.inDepth + 1,
            gene.outId, gene.outType, gene.outDepth,
            gene.weight, innovation2, true));

        if (gene.inDepth + 1 === gene.outDepth) this.resolveDepth(last(this.genes));

        return newNodeId;
    }
    mutateConnect(inId, outId, innovation) {
        const { inType, inDepth } = this.genes.find(g => g.inId === inId),
            { outType, outDepth } = this.genes.find(g => g.outId === outId);
        this.genes.push(new Neat.Gene(
            inId, inType, inDepth,
            outId, outType, outDepth,
            randomNormal(0, 1), innovation, true));//TODOFORMALIZERANDOMWEIGHTS

        if (inDepth >= outDepth) throw 'yo what the fuck';
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