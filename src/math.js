'use strict';

const multiply = (m1, m2) => m1.map((_, r1) => m2[0].map((_, c2) => m2.reduce((val, _, rc) => val + m1[r1][rc] * m2[rc][c2], 0)));
const sigmoid = n => 1 / (1 + Math.exp(-n));

const range = n => Array(n).fill(0).map((_, i) => i);

const randomRange = (start, range) => Math.random() * range + start;
const randomMinMax = (min, max) => randomRange(min, max - min);
const randomOpen = () => (r => r === 0 ? randomOpen() : r)(Math.random());
const randomNormal = (mean, stdv) => Math.sqrt(-2 * Math.log(randomOpen())) * Math.cos(2 * Math.PI * randomOpen()) * stdv + mean;

const rotationMatrix2d = angle => {
    const sin = Math.sin(angle), cos = Math.cos(angle);
    return [
        [cos, -sin],
        [sin, cos]
    ]
};

const map = (point, minDom, maxDom, minCo, maxCo) => minCo + (maxCo - minCo) * ((point - minDom) / (maxDom - minDom));

const argmax = arr => arr.reduce((a, c, i) => c > a[1] ? [i, c] : a, [-1, Number.MIN_SAFE_INTEGER])[0];
const argmin = arr => arr.reduce((a, c, i) => c < a[1] ? [i, c] : a, [-1, Number.MAX_SAFE_INTEGER])[0];