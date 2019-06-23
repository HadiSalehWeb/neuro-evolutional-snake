/// <reference path="evolution.js" />
/// <reference path="snake.js" />
/// <reference path="brain.js" />
/// <reference path="network.js" />
/// <reference path="drawing.js" />
/// <reference path="environment.js" />
'use strict';

/*
To do:
add inspection for seperate canvas
show score on death
*/

window.onload = function () {
    const mainDiv = document.querySelector('main');
    const networkTopology = [15, 3];
    let population = 50;
    let canvases;
    window.getCanvases = () => canvases;

    const evolve = function (mutationRate) {
        const chromosomes = Evolution.selectTop(Math.floor(population / 5),
            canvases.map(canv => new Individual(
                canv.environment.snakes[0].brain.network.encode(false),
                canv.environment.snakes[0].score
            ))
        );

        if (chromosomes.length == 0) chromosomes.push(new NeuralNetwork(networkTopology).encode(false));

        chromosomes.push(...Evolution.mutate(
            Evolution.crossover(chromosomes, population),
            mutationRate,
            (g => g + randomMinMax(-1, 1))
        ));

        for (let i = 0; i < population; i++) {
            canvases[i].environment.initOneSnake(chromosomes[i]);
        }
    };

    const options = {
        //0: nothing
        //1: run 1 generation
        //2: keep running generations
        currentTask: 0,
        running: false,
        fps: 10,
        mutationRate: 0.01,
        update: function () {
            if (!this.running)
                return;

            for (let canvas of canvases) {
                if (!canvas.environment.alive()) continue;//Maybe revive instead?
                canvas.environment.update();
                canvas.draw();
            }

            if (canvases.every(c => !c.environment.alive())) {//maybe not right away?
                console.log("Top score: " + canvases.reduce((a, c) => c.environment.snakes[0].score > a ? c.environment.snakes[0].score : a, Number.MIN_SAFE_INTEGER));
                evolve(this.mutationRate);
                if (this.currentTask !== 2) {
                    this.currentTask = 0;
                    this.running = false;
                    return;
                }
            }

            setTimeout(options.update.bind(options), 1000 / this.fps);
        },
        play: function () {
            this.running = true;
            this.update();
        },
        pause: function () {
            this.running = false;
        },
        stop: function () {
            this.running = false;
            this.currentTask = 0;
        },
        Run1: function () {
            this.currentTask = 1;
            this.play();
        },
        RunMany: function () {
            this.currentTask = 2;
            this.play();
        },
        Save: function () {
            alert("Not implemented");
        },
        Load: function () {
            alert("Not implemented");
        },
        New: function () {
            newSimulationFolder.open();
        },
        NewSimulation: {
            population: 50,
            width: 16,
            height: 16,
            pixelsPerUnit: 8,
            frameSize: 2,

            Create: function () {
                options.stop();
                if (Array.isArray(canvases)) {
                    alert('warning: snakes will be lost');
                    for (let i = 0; i < canvases.length; i++)
                        canvases[i].remove();
                }

                population = this.population;
                canvases = range(population).map(_ =>
                    new GameCanvas(
                        new Environment(
                            [
                                new Snake(
                                    new Brain(
                                        new Sensory(),
                                        new NeuralNetwork(networkTopology)
                                    ),
                                    Vector2.random(
                                        this.width * .4,
                                        this.width * .6,
                                        this.height * .4,
                                        this.height * .6
                                    ).floor()
                                )
                            ],
                            new Vector2(this.width, this.height)
                        ),
                        mainDiv,
                        this.pixelsPerUnit,
                        this.frameSize
                    )
                );

                newSimulationFolder.close();
            }
        }
    };

    const gui = new dat.GUI();
    gui.add(options, 'play');
    gui.add(options, 'pause');
    gui.add(options, 'stop');
    gui.add(options, 'fps').min(0);//.max(100)
    gui.add(options, 'mutationRate').min(0);
    gui.add(options, 'Run1');
    gui.add(options, 'RunMany');
    gui.add(options, 'Save');
    gui.add(options, 'Load');
    gui.add(options, 'New');
    const newSimulationFolder = gui.addFolder('New Simulation');
    newSimulationFolder.add(options.NewSimulation, 'population').min(0).step(1).max(200);
    newSimulationFolder.add(options.NewSimulation, 'width').min(0).step(1).max(512);
    newSimulationFolder.add(options.NewSimulation, 'height').min(0).step(1).max(512);
    newSimulationFolder.add(options.NewSimulation, 'pixelsPerUnit').min(0).step(1).max(64);
    newSimulationFolder.add(options.NewSimulation, 'frameSize').min(0).step(1).max(16);
    newSimulationFolder.add(options.NewSimulation, 'Create');
};
