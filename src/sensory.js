'use strict';

class Sensory {
    constructor() {
        this.variableCount = 15;
    }
    raycast(headPosition, directions, environment) {
        let pos = headPosition, pixel;
        do {
            pos = directions.reduce((a, c) => c.moveVector(a), pos);
            pixel = environment.getPixel(pos);
        } while (pixel === PixelState.Empty);
        return [Number(pixel === PixelState.Wall), Number(pixel === PixelState.Snake), Number(pixel === PixelState.Food)];
    }
    perceive(environment, headPosition, headDireciton) {
        const ret = [];

        ret.push(...this.raycast(headPosition, [headDireciton.rotateCounterClockwise()], environment));
        ret.push(...this.raycast(headPosition, [headDireciton.rotateCounterClockwise(), headDireciton], environment));
        ret.push(...this.raycast(headPosition, [headDireciton], environment));
        ret.push(...this.raycast(headPosition, [headDireciton, headDireciton.rotateClockwise()], environment));
        ret.push(...this.raycast(headPosition, [headDireciton.rotateClockwise()], environment));

        return ret;
    }
}

