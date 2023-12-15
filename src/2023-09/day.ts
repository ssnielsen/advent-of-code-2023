import {A} from '@mobily/ts-belt';
import {loadInput} from '../util';

const aperture = <T>(n: number, list: T[]): T[][] => {
    return A.range(0, list.length - n).map(i => list.slice(i, i + n));
};

const buildDiff = (line: number[]) => {
    const pairs = aperture(2, line);

    return pairs.map(([a, b]) => b - a);
};

const buildDiffHistory = (line: number[]): number[][] => {
    const allZeroes = line.every(n => n === 0);

    if (allZeroes) {
        return [line];
    } else {
        const diff = buildDiff(line);
        const history = buildDiffHistory(diff);

        return [line, ...history];
    }
};

const extrapolate = (
    prediction: number[][],
    f: (diff: number, line: number[]) => number,
) => {
    const result = [...prediction].reverse().reduce((acc, line) => {
        return f(acc, line);
    }, 0);

    return result;
};

const findHistory = (
    data: number[][],
    extrapolationFunction: (diff: number, line: number[]) => number,
) => {
    const extrapolations = data.map(line => {
        const history = buildDiffHistory(line);
        return extrapolate(history, extrapolationFunction);
    });

    const result = extrapolations.reduce((acc, n) => acc + n, 0);

    return result;
};

const part1 = (data: number[][]) => {
    return findHistory(data, (acc, line) => acc + line[line.length - 1]);
};

const part2 = (data: number[][]) => {
    return findHistory(data, (acc, line) => line[0] - acc);
};

const parse = (lines: string[]) => {
    return lines.map(line => line.split(' ').map(n => parseInt(n, 10)));
};

export const run = () => {
    const input = loadInput('2023-09');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
};

const testInput1 = `
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`
    .trim()
    .split('\n');
