'use strict';

// Next up: the last four parameters' implementation

//Todo: make sure loops don't happen in hidden layers

if (!window.Neat) window.Neat = {};

Neat.Algorithm = class {
    constructor(inputDimension, outputDimension, populationSize, parameters = {}) {
        this.populationSize = populationSize;
        this.population = range(populationSize).map(_ => Neat.Network.minimal(inputDimension, outputDimension, 0));
        this.innovation = Math.max(...this.population[0].connections.map(x => x.innovation)) + 1;
        this.species = [];
        Object.assign(this,
            Object.assign({
                compatibilityThreshold: 3,
                c1: 1,
                c2: 1,
                c3: .4,
                maxStagnation: 15,
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
                newLinkChance: .05,
            }, parameters)
        );
    }
    evaluateOneGeneration(fitnessFunction) {
        // 0. Remove shitty species from last generation

        this.species = this.species.filter(sp => sp.stagnationAge < this.maxStagnation);

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

        // 2. Eliminate least fit genomes (and adjust fitness of the rest)

        const selectedGenomes = [];

        for (let sp of this.species) {
            sp.eliminateUnfit();
            for (let genome of sp.genomes) {
                genome.fitness /= sp.genomes.length;
                selectedGenomes.push(genome);
            }
        }

        selectedGenomes.sort((a, b) => b.fitness - a.fitness);
        const totalFitness = selectedGenomes.reduce((a, c) => a + c.fitness, 0);

        // 3. Crossover (with weighted probability of selection)

        const elites = this.species
            .reduce((a, c) => c.genomes.length > this.eliteSpeciesThreshold ? a.concat(c.genomes.slice(0, this.elitistCount)) : a, []);

        const offsprings = [];

        // Rewrite this shit it's completely wrong. It should instead only crossover genomes within the same species with a small chance of interspecies crossover
        while (offsprings.length + elites.length < this.populationSize * (1 - this.mutationWithoutCrossoverRate)) {
            let p1 = randomRange(0, totalFitness), p2 = randomRange(0, totalFitness), i1 = 0, i2 = 0;

            while (p1 > selectedGenomes[i1].fitness) {
                p1 -= selectedGenomes[i1].fitness;
                i1++;
            }

            while (p2 > selectedGenomes[i2].fitness) {
                p2 -= selectedGenomes[i2].fitness;
                i2++;
            }

            if (i1 === i2) continue;

            offsprings.push(selectedGenomes[i1].crossover(selectedGenomes[i2]));
        }

        // 4. Mutate

        for (let genome of offsprings) {
            if (Math.random() < this.genomeWeightMutationChance) {
                for (let gene of genome.genes) {
                    const r = Math.random();
                    if (r < this.geneWeightPerturbationChance) {
                        gene.weight += this.weightPerturbation * randomSign();
                    } else if (r < this.geneWeightPerturbationChance + this.geneWeightNewValueChance) {
                        gene.weight = randomNormal(0, this.weightNewValueStdv);
                    }
                }
            }


        }

        // 5. Mutate without crossover

        const mutants = [];

        while (mutants.length + offsprings.length + elites.length < this.populationSize) {

            this.mutants.push(mutate(SomeoneFromSelectedGenomes));
        }

        // Decode

        this.population = [...elites, ...offsprings, ...mutants].map(g => g.decode());
    }
}
/*
Cycle:
    1. Make population;
    2. Evaluate (find fitness);
    3. Eliminate lowest;
    4. Crossover until full;
    5. Mutate;
    6. Back to (2)
*/

const adjustFitness = function (species) {
    for (let sp of species) {
    }
}