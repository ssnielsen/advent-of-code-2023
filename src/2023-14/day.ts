import {A} from '@mobily/ts-belt';
import {loadInput} from '../util';

type Direction = 'north' | 'east' | 'south' | 'west';

const ROUND = 'O';
const CUBE = '#';
const EMPTY = '.';

type Tile = typeof ROUND | typeof CUBE | typeof EMPTY;

type Platform = Tile[][];

const transpose = (platform: Platform) => {
    const result: Platform = [];
    for (let i = 0; i < platform[0].length; i++) {
        result.push(platform.map(row => row[i]));
    }
    return result;
};

// Move the round tiles as far to the front of the row as possible.
// They cannot move past cube tiles.
const tiltRow = (row: Tile[]) => {
    const result = [...row];

    for (let i = 0; i < result.length; i++) {
        if (result[i] === ROUND) {
            let j = i;
            while (j > 0 && result[j - 1] === EMPTY) {
                result[j - 1] = ROUND;
                result[j] = EMPTY;
                j--;
            }
        }
    }

    return result;
};

const tilt = (platform: Platform, direction: Direction) => {
    switch (direction) {
        case 'north': {
            const transposed = transpose(platform);
            const tilted = transposed.map(tiltRow);
            const tiltedTransposed = transpose(tilted);
            return tiltedTransposed;
        }
        case 'east':
            return platform
                .map(row => A.reverse(row) as Tile[])
                .map((row: Tile[]) => tiltRow(row))
                .map(row => A.reverse(row) as Tile[]);
        case 'south': {
            const transposed = transpose(platform);
            const tilted = transposed
                .map(row => A.reverse(row) as Tile[])
                .map((row: Tile[]) => tiltRow(row))
                .map(row => A.reverse(row) as Tile[]);
            const tiltedTransposed = transpose(tilted);
            return tiltedTransposed;
        }
        case 'west':
            return platform.map(tiltRow);
    }
};

const calculateLoad = (row: number, size: number) => {
    return size - row;
};

const totalLoad = (platform: Platform) => {
    const result = platform.reduce((acc, row, rowIndex) => {
        const rowLoad = row.reduce((acc, tile) => {
            return (
                acc +
                (tile === ROUND ? calculateLoad(rowIndex, platform.length) : 0)
            );
        }, 0);

        return acc + rowLoad;
    }, 0);

    return result;
};

const printPlatform = (platform: Platform) => {
    console.log(platform.map(row => row.join('')).join('\n'));
    console.log();
};

const part1 = (data: Platform) => {
    const tilted = tilt(data, 'north');

    const result = totalLoad(tilted);

    return result;
};

const stringify = (platform: Platform) => {
    const result = platform.map(row => row.join('')).join('');

    return result;
};

const part2 = (data: Platform) => {
    const CYCLES = 1000000000;

    const cache = new Map<string, number>();
    let i = 0;

    while (i < CYCLES) {
        const tiltedNorth = tilt(data, 'north');
        const tiltedWest = tilt(tiltedNorth, 'west');
        const tiltedSouth = tilt(tiltedWest, 'south');
        const tiltedEast = tilt(tiltedSouth, 'east');

        const stringified = stringify(tiltedEast);
        const cached = cache.get(stringified);

        if (cached) {
            const distanceLeft = CYCLES - i;
            const loopLength = i - cached;
            // console.log('Distance left:', distanceLeft);
            // console.log('Loop length:', loopLength);
            // console.log('New i', CYCLES - (distanceLeft % loopLength));
            i = CYCLES - (distanceLeft % loopLength);
        }

        cache.set(stringified, i);
        i += 1;
        data = tiltedEast;
    }

    const result = totalLoad(data);

    return result;
};

const parse = (input: string[]) => {
    const result = input.map(line => line.split('') as Tile[]);

    return result;
};

export const run = () => {
    const input = loadInput('2023-14');
    const data = parse(input);
    console.log(part1(data));
    console.log(part2(data));
};

const testInput1 = `
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`
    .trim()
    .split('\n');
