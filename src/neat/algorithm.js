'use strict';

//Todo: make sure loops don't happen in hidden layers

if (!window.Neat) window.Neat = {};

Neat.Algorithm = class {
    constructor(inputDimension, outputDimension, populationSize) {
        this.populationSize = populationSize;
        this.population = range(populationSize).map(_ => Neat.Network.minimal(inputDimension, outputDimension, 0));
        this.innovation = Math.max(...this.population[0].connections.map(x => x.innovation)) + 1;
        this.species = [];
    }
    evaluateOneGeneration(fitnessFunction, compatibilityThreshold, c1, c2, c3, ) {
        // 0. Remove shitty species from last generation

        this.species = this.species.filter(sp => sp.ageSinceNewMax < 15);

        // 1. Sort current population into species

        this.species = this.species.map(sp => sp.progressOneGeneration());
        const newGenomes = this.population.map(o => o.encode(fitnessFunction(o)));

        for (let genome of newGenomes) {
            let foundSpecies = false;

            for (let sp of this.species) {
                if (sp.compatibilityDistance(genome, c1, c2, c3) <= compatibilityThreshold) {
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

        this.population = this.species.reduce((a, c) => c.genomes.length > 5 ? a.concat(c.genomes[0]) : a, []);

        while (this.population.length < this.populationSize) {
            let p1 = randomRange(0, totalFitness), p2 = randomRange(0, totalFitness), i1 = 0, i2 = 0;

            while (p1 > selectedGenomes[i1].fitness) {
                p1 -= selectedGenomes[i1].fitness;
                i1++;
            }

            while (p2 > selectedGenomes[i2].fitness) {
                p2 -= selectedGenomes[i2].fitness;
                i2++;
            }

            this.population.push(selectedGenomes[i1].crossover(selectedGenomes[i2]));
        }

        // 4. Mutate

        // fuck me
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