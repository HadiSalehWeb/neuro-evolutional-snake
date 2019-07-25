'use strict';

const multiply = (m1, m2) => m1.map((_, r1) => m2[0].map((_, c2) => m2.reduce((val, _, rc) => val + m1[r1][rc] * m2[rc][c2], 0)));
const sigmoid = n => 1 / (1 + Math.exp(-n));
const argmax = arr => arr.reduce((a, c, i) => c > a[1] ? [i, c] : a, [-1, Number.MIN_SAFE_INTEGER])[0];
const argmin = arr => arr.reduce((a, c, i) => c < a[1] ? [i, c] : a, [-1, Number.MAX_SAFE_INTEGER])[0];

const range = n => Array(n).fill(0).map((_, i) => i);
const flatten = arr => arr.reduce((a, c) => a.concat(c instanceof Array ? flatten(c) : c), []);
const last = arr => arr[arr.length - 1];
const head = arr => arr[0];
const tail = arr => arr.slice(1);
const init = arr => arr.slice(0, arr.length - 1);
const middle = arr => init(tail(arr));
const unique = (arr, selector) => arr.reduce((a, c) => a.some(x => selector(x) === selector(c)) ? a : a.concat(c), []);
const removeAt = (arr, i) => arr.slice(0, i).concat(arr.slice(i + 1));

const randomSign = () => Math.random() < .5 ? -1 : 1;
const randomRange = (start, range) => Math.random() * range + start;
const randomMinMax = (min, max) => randomRange(min, max - min);
const randomOpen = () => (r => r === 0 ? randomOpen() : r)(Math.random());
const randomNormal = (mean, stdv) => Math.sqrt(-2 * Math.log(randomOpen())) * Math.cos(2 * Math.PI * randomOpen()) * stdv + mean;

const randomElementFrom = arr => arr[Math.floor(Math.random() * arr.length)];

/**
 * Returns the index of the selected element.
 */
const weightedRandomElementFrom = function (arr, totalWeight, weightSelector) {
    let rand = Math.random() * totalWeight, i = 0;

    while (true) {
        rand -= weightSelector(arr[i]);
        if (rand < 0) break;
        i++;
    }

    return i;
}