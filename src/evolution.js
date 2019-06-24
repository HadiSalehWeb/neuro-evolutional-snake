'use strict';

class Individual {
    constructor(chromosome, fitness) {
        this.chromosome = chromosome;
        this.fitness = fitness;
    }
}

const Evolution = (function () {
    // const crossoverChromosomes = (a, b) => (r => [...a.slice(0, r), ...b.slice(r)])(Math.floor(Math.random() * a.length));
    // const crossoverChromosomes = (a, b) => a.map((x, i) => (r => r * x + (1 - r) * b[i])(Math.random()));
    const crossoverChromosomes = (a, b) => a.map((x, i) => (r => r * x + (1 - r) * b[i])(.5));
    const selectRandom = arr => arr[Math.floor(Math.random() * arr.length)];

    return {
        select: function (population) {
            const maxScore = population.reduce((a, c) => c.fitness > a ? c.fitness : a, Number.MIN_SAFE_INTEGER);
            const minScore = population.reduce((a, c) => c.fitness < a ? c.fitness : a, Number.MAX_SAFE_INTEGER);
            const range = maxScore - minScore;
            return population.filter(x => Math.random() < (x.fitness - minScore) / range).map(x => x.chromosome);
        },
        selectTop: function (n, population) {
            const sorted = population.slice();
            sorted.sort((a, b) => b.fitness - a.fitness);
            return sorted.slice(0, n).map(x => x.chromosome);
        },
        crossover: function (chromosomes, targetCount) {
            return range(targetCount - chromosomes.length).map(_ =>
                crossoverChromosomes(selectRandom(chromosomes), selectRandom(chromosomes)));
        },
        mutate: function (chromosomes, mutationRate, newGene) {
            return chromosomes.map(chromosome => chromosome.map(gene => Math.random() < mutationRate ? newGene(gene) : gene));
        }
    }
})();



if (!window.tests) window.tests = [];

window.tests.push(function () {

    console.log("Environement tests passed.");
});