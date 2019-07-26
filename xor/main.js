/// <reference path="../src/math.js" />
/// <reference path="../src/neat/node.js" />
/// <reference path="../src/neat/connection.js" />
/// <reference path="../src/neat/gene.js" />
/// <reference path="../src/neat/genome.js" />
/// <reference path="../src/neat/innovation.js" />
/// <reference path="../src/neat/network.js" />
/// <reference path="../src/neat/species.js" />
/// <reference path="../src/neat/algorithm.js" />

'use strict';

window.onload = function () {
    const width = 400, height = 400;
    const canvas = document.getElementById('xor');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const neat = new Neat.Algorithm(2, 1, 150, {

    });
    const data = [
        [[0, 0], 0],
        [[0, 1], 1],
        [[1, 0], 1],
        [[1, 1], 0]
    ];
    const fitness = net => 4 - data.reduce((error, sample) => error + Math.pow(net.feedforward(sample[0]) - sample[1], 2), 0);

    const draw = function (net) {
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        let val;

        for (let i = 0, d = 0; i < width; i++)
            for (let j = 0; j < height; j++) {
                val = net.feedforward([i / (width - 1), j / (height - 1)]) * 255;
                data[d + 0] = val;
                data[d + 1] = val;
                data[d + 2] = val;
                data[d + 3] = 255;
                d += 4;
            }

        ctx.putImageData(imageData, 0, 0);
    }

    draw(neat.getFittest(fitness));

    window.cycle = function () {
        neat.evaluateOneGeneration(fitness);
        console.log(neat.species);
        let fittest = neat.getFittest(fitness);
        console.log('Fittest: ', fittest, '. Fitness: ', fitness(fittest));
        draw(fittest);
    }
};