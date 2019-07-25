'use strict';

class Snake {
    constructor(brain, head, body, direction, score, alive, killOnLoop) {
        this.brain = brain instanceof Brain ? brain : new Brain();
        this.head = head instanceof Vector2 ? head : Vector2.zero;
        this.body = body instanceof Array && body.every(x => x instanceof Direction) ? body : [];
        this.direction = direction instanceof Direction ? direction : Direction.random();
        this.score = score instanceof Number ? score : 0;
        this.alive = alive instanceof Boolean ? alive : true;
        this.killOnLoop = killOnLoop instanceof Boolean ? killOnLoop : true;
        this.stateHistory = [];
    }
    update(environment) {
        if (!this.alive) return;

        switch (this.brain.nextDecision(environment, this)) {
            case Decision.RotateClockwise:
                this.direction = this.direction.rotateClockwise();
                break;
            case Decision.RotateCounterClockwise:
                this.direction = this.direction.rotateCounterClockwise();
                break;
            case Decision.None:
            default:
                break;
        }

        const nextHeadPosition = this.direction.moveVector(this.head);
        const headPixel = environment.getPixel(nextHeadPosition);

        if (headPixel === PixelState.Wall || headPixel === PixelState.Snake || (this.killOnLoop && this.hasLooped())) {
            this.alive = false;
            return;
        }

        if (this.killOnLoop) this.stateHistory.push([this.head, this.direction, ...this.body]);

        this.body.unshift(this.direction.reverse());
        this.head = nextHeadPosition;

        if (headPixel === PixelState.Food) {
            environment.updateFoodPosition();
            this.score += 10;
            this.stateHistory = [];
        } else {
            this.body.pop();
            if (this.direction.pointsTowards(environment.food.substract(this.head))) this.score += 1;
            else this.score -= 1.5;
        }
    }
    intersects(pos) {
        let i = 0, me = this.head;
        if (me.equals(pos)) return true;

        while (i < this.body.length) {
            me = this.body[i++].moveVector(me);
            if (me.equals(pos)) return true;
        }

        return false;
    }
    hasLooped() {
        return this.stateHistory.some(state =>
            state[0].equals(this.head) &&
            state[1].equals(this.direction) &&
            state.slice(2).every((pos, i) => pos.equals(this.body[i]))
        );
    }
}


if (!window.tests) window.tests = [];

window.tests.push(function () {
    const snake = new Snake(new Brain(), new Vector2(2, 2), [
        Direction.up, Direction.up, Direction.right, Direction.right, Direction.right, Direction.up, Direction.up, Direction.left, Direction.left, Direction.down
    ], Direction.right);

    class GridTestEnvironment {
        constructor(arr) {
            this.arr = arr;
            this.getPixel = ({ x, y }) => arr[x][y];
            this.updateFoodPosition = () => { };
            this.food = new Vector2(4, 2);
        }
    }

    const grid = new GridTestEnvironment([
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 2, 2, 2, 0, 0, 0, 1],
        [1, 0, 0, 0, 2, 2, 2, 0, 1],
        [1, 0, 3, 0, 2, 0, 2, 0, 1],
        [1, 0, 0, 0, 2, 2, 2, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ]);

    console.assert(grid.arr.reduce((a, c, i) => a &&
        c.reduce((a, c, j) => a &&
            (c === 2) === snake.intersects(new Vector2(i, j))
            , true)
        , true) === true);

    snake.brain = { nextDecision: () => Decision.None };

    snake.update(grid);

    console.assert(snake.score === 1);
    console.assert([
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 2, 2, 2, 0, 0, 0, 1],
        [1, 0, 2, 0, 2, 0, 2, 0, 1],
        [1, 0, 3, 0, 2, 0, 2, 0, 1],
        [1, 0, 0, 0, 2, 2, 2, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ].reduce((a, c, i) => a &&
        c.reduce((a, c, j) => a &&
            (c === 2) === snake.intersects(new Vector2(i, j))
            , true)
        , true) === true);

    snake.update(grid);

    console.assert(snake.score === 11);
    console.assert([
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 2, 2, 2, 0, 0, 0, 1],
        [1, 0, 2, 0, 2, 0, 2, 0, 1],
        [1, 0, 2, 0, 2, 0, 2, 0, 1],
        [1, 0, 0, 0, 2, 2, 2, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ].reduce((a, c, i) => a &&
        c.reduce((a, c, j) => a &&
            (c === 2) === snake.intersects(new Vector2(i, j))
            , true)
        , true) === true);

    console.log("Snake tests passed.");
});