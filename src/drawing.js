'use strict';

//todo: display score on death
class GameCanvas {
    constructor(environment, parent, pixelPerUnit, frameSize) {
        this.environment = environment;
        this.parent = parent || document.body;
        this.pixelPerUnit = pixelPerUnit || 3;
        this.frameSize = frameSize || 1;
        this.width = environment.size.x * pixelPerUnit;
        this.height = environment.size.y * pixelPerUnit;
        this.snakeColor = '#FFFFFF';
        this.snakeFrameColor = '#000000';
        this.foodColor = '#FF234F';
        this.foodFrameColor = '#003431';
        this.backgroundColor = '#333333';
        this.deathOverlayColor = 'rgba(0, 0, 0, .3)';
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        parent.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        ctx.scale(1, -1);
        ctx.translate(0, -this.height);
        this.canvas = canvas;
        this.ctx = ctx;
    }
    remove() {
        this.parent.removeChild(this.canvas);
    }
    drawBackground() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    drawSquare(pos, fillColor, strokeColor) {
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(pos.x * this.pixelPerUnit + this.frameSize, pos.y * this.pixelPerUnit + this.frameSize, this.pixelPerUnit - this.frameSize * 2, this.pixelPerUnit - this.frameSize * 2);
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = this.frameSize;
        this.ctx.strokeRect(pos.x * this.pixelPerUnit, pos.y * this.pixelPerUnit, this.pixelPerUnit, this.pixelPerUnit);
    }
    drawSnake(snake) {
        let pos = snake.head;
        //head:
        this.drawSquare(pos, this.snakeColor, this.snakeFrameColor);
        //body:
        for (let i = 0; i < snake.body.length; i++) {
            pos = snake.body[i].moveVector(pos);
            this.drawSquare(pos, this.snakeColor, this.snakeFrameColor);
        }
    }
    drawFood(pos) {
        this.drawSquare(pos, this.foodColor, this.foodFrameColor);
    }
    drawDeath() {
        this.ctx.fillStyle = this.deathOverlayColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    draw() {
        //background
        this.drawBackground();
        for (let snake of this.environment.snakes)
            this.drawSnake(snake);
        this.drawFood(this.environment.food);
        if (this.environment.snakes.every(x => !x.alive))
            this.drawDeath();
    }
}







