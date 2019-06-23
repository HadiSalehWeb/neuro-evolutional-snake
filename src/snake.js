'use strict';

//Todo: loop

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

