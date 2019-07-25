'use strict';

if (!window.Neat) window.Neat = {};

Neat.Algorithm = class {
    constructor(inputDimension, outputDimension, populationSize, parameters = {}) {
        this.populationSize = populationSize;
        this.population = range(populationSize).map(_ => Neat.Network.minimal(inputDimension, outputDimension, 0));
        this.species = [];

        this.innovationNumber = Math.max(...this.population[0].connections.map(x => x.innovation)) + 1;
        this.nodeId = Math.max(...flatten(this.population[0].connections.map(x => [x.inId, x.outId])));
        this.newNodeInnovations = [];
        this.newConnectionInnovations = [];

        this.maxFitness = -1;
        this.stagnationAge = 0;

        Object.assign(this,
            Object.assign({
                compatibilityThreshold: 3,
                c1: 1,
                c2: 1,
                c3: .4,
                maxSpeciesStagnation: 15,
                maxPopulationStagnation: 20,
                eliteSpeciesThreshold: 5,
                elitistCount: 1,
                genomeWeightMutationChance: .8,
                geneWeightPerturbationChance: .9,
                geneWeightNewValueChance: .1,
                weightPerturbation: .1,
                weightNewValueStdv: 1,
                mutationWithoutCrossoverRate: .25,
                interspeciesMatingRate: .001,
                newNodeChance: .03,
                newConnectionChance: .05,
            }, parameters)
        );
    }
    static findNodesToConnect(genome) {
        const fromNodes = unique(genome.genes.slice(), x => x.inId)
        while (fromNodes.length > 0) {
            const fromIndex = Math.floor(Math.random() * fromNodes.length);
            const fromGene = fromNodes[fromIndex];

            const toNodes = unique(genome.genes.filter(g => g.outDepth > fromGene.inDepth).slice(), x => x.outId);
            while (toNodes.length > 0) {
                const toIndex = Math.floor(Math.random() * toNodes.length);
                const toGene = toNodes[toIndex];
                if (!genome.genes.some(g => g.inId === fromGene.inId && g.outId === toGene.outId))
                    return [fromGene.inId, toNode.outId];

                toNodes.splice(toIndex, 1);
            }

            genes.splice(fromIndex, 1);
        }
        return undefined;
    }
    mutateWeights(genome) {
        for (let gene of genome.genes) {
            const r = Math.random();
            if (r < this.geneWeightPerturbationChance) {
                gene.weight += this.weightPerturbation * randomSign();
            } else if (r < this.geneWeightPerturbationChance + this.geneWeightNewValueChance) {
                gene.weight = randomNormal(0, this.weightNewValueStdv);
            }
        }
    }
    addNode(genome) {
        const geneIndex = randomElementFrom(genome.genes.map((g, i) => [g, i]).filter(a => a[0].enabled))[1];
        const gene = genome.genes[geneIndex];
        let innov = this.newNodeInnovations.find(i => i.equals(gene.innovation));

        if (innov === undefined) {
            innov = new Neat.Innovation.AddNode(gene.innovation, this.innovationNumber++, this.innovationNumber++, this.nodeId++);
            this.newNodeInnovations.push(innov);
        }

        genome.mutateSplit(geneIndex, innov.newInnovation1, innov.newInnovation2, innov.newNodeId);
    }
    addConnection(genome) {
        const nodes = Neat.Algorithm.findNodesToConnect(genome);
        const [inId, outId] = nodes;

        let innov = this.newConnectionInnovations.find(i => i.equals(inId, outId));

        if (innov === undefined) {
            innov = new Neat.Innovation.AddConnection(idId, outId, this.innovationNumber++);
            this.newConnectionInnovations.push(innov);
        }

        genome.mutateConnect(inId, outId, innov.newInnovation);
    }
    evaluateOneGeneration(fitnessFunction) {
        // 0. Remove shitty species from last generation

        this.species = this.species.filter(sp => sp.stagnationAge < this.maxSpeciesStagnation);

        // 1. Classify current population into species

        this.species = this.species.map(sp => sp.progressOneGeneration());
        const newGenomes = this.population.map((o, i) => o.encode(fitnessFunction(o, i)));

        for (let genome of newGenomes) {
            let foundSpecies = false;

            for (let sp of this.species) {
                if (sp.compatibilityDistance(genome, this.c1, this.c2, this.c3) <= this.compatibilityThreshold) {
                    sp.addGenome(genome);
                    foundSpecies = true;
                    break;
                }
            }

            if (!foundSpecies) {
                const sp = new Neat.Species(genome);
                sp.addGenome(genome);
                this.species.push(sp);
            }
        }

        // 2. Eliminate least fit genomes

        for (let sp of this.species)
            sp.eliminateUnfitAndSetFitness();

        this.species.sort((a, b) => b.speciesFitness - a.speciesFitness);

        // 3. Check if whole population is stagnant

        const maxFitness = Math.max(...newGenomes.map(x => x.fitness));
        if (maxFitness > this.maxFitness) {
            this.maxFitness = maxFitness;
            this.stagnationAge = 0;
        } else this.stagnationAge++;

        if (this.stagnationAge > this.maxPopulationStagnation)
            this.species = this.species.slice(0, 2);

        // 3. Crossover (with weighted probability of selection)

        const totalSpeciesFitness = this.species.reduce((a, c) => a + c.speciesFitness, 0);

        const elites = this.species
            .reduce((a, c) => c.genomes.length > this.eliteSpeciesThreshold ? a.concat(c.genomes.slice(0, this.elitistCount)) : a, []);

        const offsprings = [];

        while (offsprings.length + elites.length < this.populationSize * (1 - this.mutationWithoutCrossoverRate)) {
            const isp1 = weightedRandomElementFrom(this.species, totalSpeciesFitness, s => s.speciesFitness),
                sp1 = this.species[isp1],
                ig1 = weightedRandomElementFrom(sp1.genomes, sp1.totalGenomeFitness, g => g.fitness),
                g1 = sp1.genomes[ig1];

            let g2;

            if (Math.random() < this.interspeciesMatingRate) {
                const isp2 = weightedRandomElementFrom(
                    removeAt(this.species, isp1),
                    totalSpeciesFitness - sp1.speciesFitness,
                    s => s.speciesFitness
                ),
                    sp2 = this.species[isp2];//,
                //ig2 = weightedRandomElementFrom(sp2.genomes, sp2.totalGenomeFitness, g => g.fitness);
                g2 = sp2.genomes[0];//sp2.genomes[ig2];
            } else {
                g2 = sp1.genomes[weightedRandomElementFrom(removeAt(sp1.genomes, ig1), sp1.totalGenomeFitness - g1.fitness, g => g.fitness)];
            }

            offsprings.push(g1.crossover(g2));
        }

        // 4. Mutate

        for (let genome of offsprings) {
            if (Math.random() < this.genomeWeightMutationChance) {
                this.mutateWeights(genome);
            }
            if (Math.random() < this.newNodeChance) {
                this.addNode(genome);
            }
            if (Math.random() < this.newConnectionChance) {
                this.addConnection(genome);
            }
        }

        // 5. Mutate without crossover

        const mutants = [];
        const totalMutationProbs = this.genomeWeightMutationChance + this.newNodeChance + this.newConnectionChance;
        let rand;

        while (mutants.length + offsprings.length + elites.length < this.populationSize) {
            const sp1 = this.species[weightedRandomElementFrom(this.species, totalSpeciesFitness, s => s.speciesFitness)];
            const genome = Neat.Genome.fromGenome(sp1.genes[weightedRandomElementFrom(sp1.genomes, sp1.totalGenomeFitness, g => g.fitness)]);

            rand = Math.random();
            if (rand < this.genomeWeightMutationChance) {
                this.mutateWeights(genome);
            } else if (rand < this.genomeWeightMutationChance + this.newNodeChance) {
                this.addNode(genome);
            } else {
                this.addConnection(genome);
            }

            this.mutants.push(genome);
        }

        // 6. Decode

        this.population = [...elites, ...offsprings, ...mutants].map(g => g.decode());
    }
}