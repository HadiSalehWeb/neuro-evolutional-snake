'use strict';

if (!window.Neat) window.Neat = {};

Neat.Species = class {
    constructor(representative, maxFitness = 0, stagnationAge = 0) {
        this.representative = representative;
        this.genomes = [];
        this.maxFitness = maxFitness;
        this.stagnationAge = stagnationAge;
    }
    addGenome(genome) {
        this.genomes.push(genome);
    }
    compatibilityDistance(genome, c1, c2, c3) {
        let matchingGeneCount = 0, disjointGeneCount = 0, excessGeneCount = 0, totalWeightDifference = 0;

        let genes1 = this.representative.genes, genes2 = genome.genes, i1 = 0, i2 = 0, cluster1 = 0, cluster2 = 0;

        while (i1 < genes1.length || i2 < genes2.length) {
            if (i1 >= genes1.length) {
                excessGeneCount = genes2.length - i2;
                break;
            } else if (i2 >= genes2.length) {
                excessGeneCount = genes1.length - i1;
                break;
            } else if (genes1[i1].innovation < genes2[i2].innovation) {
                if (cluster2 !== 0) {
                    disjointGeneCount += cluster2;
                    cluster2 = 0;
                }
                cluster1++;
                i1++;
            } else if (genes2[i2].innovation < genes1[i1].innovation) {
                if (cluster1 !== 0) {
                    disjointGeneCount += cluster1;
                    cluster1 = 0;
                }
                cluster2++;
                i2++;
            } else if (genes1[i1].innovation === genes2[i2].innovation) {
                // Either (one of the two cluster is non-zero,) or (neither is)
                if (cluster1 !== 0 || cluster2 !== 0) {
                    disjointGeneCount += cluster1 + cluster2;
                    cluster1 = 0;
                    cluster2 = 0;
                }
                totalWeightDifference += Math.abs(genes1[i1].weight - genes2[i2].weight);
                matchingGeneCount++;
                i1++;
                i2++;
            }
        }

        const genomeLength = Math.max(genes1.length, genes2.length);
        const normalizingFactor = genomeLength < 20 ? 1 : genomeLength;

        return c1 * disjointGeneCount / normalizingFactor +
            c2 * excessGeneCount / normalizingFactor +
            c3 * totalWeightDifference / matchingGeneCount;
    }
    eliminateUnfit() {
        this.genomes.sort((a, b) => b.fitness - a.fitness);
        this.genomes = this.genomes.slice(0, Math.floor(this.genomes.length / 2));
    }
    progressOneGeneration() {
        let maxFitness = Math.max(...this.genomes.map(g => g.fitness));

        if (maxFitness > this.maxFitness)
            return new Neat.Species(randomElementFrom(this.genomes), maxFitness, 0);
        else
            return new Neat.Species(randomElementFrom(this.genomes), this.maxFitness, this.stagnationAge + 1);
    }
    toJOSN() {
        return {
            representative: this.representative.toJOSN(),
            genomes: this.genomes.map(g => g.toJOSN()),
            maxFitness: this.maxFitness,
            stagnationAge: this.stagnationAge
        }
    }
    toString() {
        return `Species(representative: ${this.representative.toString()}, geomes: [${this.genomes.map(g => g.toString()).join(', ')}], maxFitness: ${this.maxFitness}, stagnationAge: ${this.stagnationAge})`;
    }
}