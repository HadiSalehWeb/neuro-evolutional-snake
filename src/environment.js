'use strict';

class Environment {
    constructor(snakes, size, food) {
        this.snakes = snakes instanceof Array && snakes.every(x => x instanceof Snake) ? snakes : [];
        this.size = size instanceof Vector2 ? size : new Vector2(512, 512);
        this.food = food instanceof Vector2 ? food : Vector2.random(0, size.x, 0, size.y).floor();
        if (this.snakes.some(s => s.intersects(this.food)))
            this.updateFoodPosition();
    }
    alive() {
        return this.snakes.some(x => x.alive);
    }
    getPixel(pos) {
        if (pos.equals(this.food)) return PixelState.Food;
        if (pos.x < 0 || pos.y < 0 || pos.x >= this.size.x || pos.y >= this.size.y) return PixelState.Wall;
        if (this.snakes.some(s => s.intersects(pos))) return PixelState.Snake;
        return PixelState.Empty;
    }
    updateFoodPosition() {
        let pos;
        do {
            pos = Vector2.random(0, this.size.x, 0, this.size.y).floor();
        } while (this.snakes.some(s => s.intersects(pos)));
        this.food = pos;
    }
    update() {
        this.snakes.forEach(snake => {
            snake.update(this);
        });
    }
    initOneSnake(chromosome) {
        this.snakes = [
            new Snake(
                new Brain(
                    new Sensory(),
                    NeuralNetwork.decodeNoMeta(this.snakes[0].brain.network.layers, chromosome)
                ),
                Vector2.random(this.size.x * .4, this.size.x * .6, this.size.y * .4, this.size.y * .6).floor()
            )
        ];
        this.updateFoodPosition();
    }
}




