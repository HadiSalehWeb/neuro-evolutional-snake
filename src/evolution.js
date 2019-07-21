'use strict';

//Todo: replace 'Individual' with 'organism'

class Individual {
    constructor(chromosome, fitness) {
        this.chromosome = chromosome;
        this.fitness = fitness;
    }
}

const Evolution = (function () {
    const selectUnique = (n, arr) => {
        if (n === 0) return [];
        const i = Math.floor(Math.random() * arr.length);
        return selectUnique(n - 1, arr.slice(0, i).concat(arr.slice(i + 1))).concat([arr[i]]);
    };

    return {
        crossoverFunctions: {
            copy: (a, b) => a,
            randomInterpolate: (a, b) => a.map((x, i) => (r => r * x + (1 - r) * b[i])(Math.random())),
            averageInterpolate: (a, b) => a.map((x, i) => (.5 * x + .5 * b[i])),
            randomCut: (a, b) => (p => [...a.slice(0, p), ...b.slice(p)])(Math.floor(Math.random() * (a.length + 1))),
            alternate: (a, b) => a.map((x, i) => i % 2 === 0 ? x : b[i])
        },
        select: function (population) {
            const maxScore = population.reduce((a, c) => c.fitness > a ? c.fitness : a, Number.MIN_SAFE_INTEGER);
            const minScore = population.reduce((a, c) => c.fitness < a ? c.fitness : a, Number.MAX_SAFE_INTEGER);
            const range = maxScore - minScore;
            const sorted = population.slice();
            sorted.sort((a, b) => b.fitness - a.fitness);
            return sorted.filter(x => Math.random() < (x.fitness - minScore) / range).map(x => x.chromosome);
        },
        selectTop: function (n, population) {
            const sorted = population.slice();
            sorted.sort((a, b) => b.fitness - a.fitness);
            return sorted.slice(0, n).map(x => x.chromosome);
        },
        crossover: function (chromosomes, targetCount, crossoverFunction) {
            return range(targetCount - chromosomes.length).map(_ =>
                crossoverFunction(...selectUnique(2, chromosomes))
            );
        },
        mutate: function (chromosomes, mutationRate, newGene) {
            return chromosomes.map(chromosome => chromosome.map(gene => Math.random() < mutationRate ? newGene(gene) : gene));
        }
    }
})();



if (!window.tests) window.tests = [];

window.tests.push(function () {
    // Top is guaranteed to succeed
    console.assert(Evolution.select([
        new Individual(0, 0),
        new Individual(1, 1),
        new Individual(2, 2),
        new Individual(3, 3),
        new Individual(4, 4),
        new Individual(5, 5),
        new Individual(6, 6),
        new Individual(7, 7)
    ])[0] === 7);

    // Bottom is guaranteed to fail
    console.assert(!Evolution.select([
        new Individual(0, 0),
        new Individual(1, 1),
        new Individual(2, 2),
        new Individual(3, 3),
        new Individual(4, 4),
        new Individual(5, 5),
        new Individual(6, 6),
        new Individual(7, 7)
    ]).some(x => x === 0));

    console.assert(Evolution.selectTop(3, [
        new Individual(0, 0),
        new Individual(1, 1),
        new Individual(2, 2),
        new Individual(3, 3),
        new Individual(4, 4),
        new Individual(5, 5),
        new Individual(6, 6),
        new Individual(7, 7)
    ]).reduce((a, c, i) => a && c === [7, 6, 5][i], true));

    console.log("Evolution tests passed.");
});