import {A, B, N, pipe} from '@mobily/ts-belt';
import {loadInput} from '../util';

const Galaxy = '#' as const;
const Empty = '.' as const;

type Tile = typeof Galaxy | typeof Empty;
type Image = Tile[][];

const transpose = <T>(matrix: T[][]): T[][] => {
    return A.range(0, matrix[0].length).map(i => matrix.map(row => row[i]));
};

const expandRows = (image: Image) => {
    return image.flatMap(row => {
        if (row.every(tile => tile === Empty)) {
            return [row, row];
        } else {
            return [row];
        }
    });
};

const expandImage = (image: Image) => {
    return pipe(image, expandRows, transpose, expandRows, transpose);
};

const printImage = (image: Image) => {
    console.log(image.map(row => row.join('')).join('\n'));
};

const findGalaxies = (image: Image) => {
    const galaxies: [number, number][] = [];
    image.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile === Galaxy) {
                galaxies.push([x, y]);
            }
        });
    });
    return galaxies;
};

const uniqueGalaxyPairs = (galaxies: [number, number][]) => {
    return galaxies
        .flatMap((g1, index) => {
            return A.range(index + 1, galaxies.length - 1).map(i => {
                return [g1, galaxies[i]];
            });
        })
        .filter(([g1, g2]) => {
            return !(g1[0] === g2[0] && g1[1] === g2[1]);
        });
};

const distance = ([x1, y1]: [number, number], [x2, y2]: [number, number]) => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

const hasValue = <T>(value: T | null): value is T => {
    return value !== null;
};

const emptyRowIndexes = (image: Image) => {
    return image
        .map((row, index) => (row.every(tile => tile === Empty) ? index : null))
        .filter(hasValue);
};

const part1 = (image: Image) => {
    const expandedImage = expandImage(image);
    const galaxies = findGalaxies(expandedImage);
    const galaxyPairs = uniqueGalaxyPairs(galaxies);
    const galaxyDistances = galaxyPairs.map(([g1, g2]) => distance(g1, g2));

    const result = A.reduce(galaxyDistances, 0, N.add);

    return result;
};

const getEmpties = (emptyInAxies: number[], from: number, to: number) => {
    return emptyInAxies.filter(index => index >= from && index <= to).length;
};

const part2 = (image: Image) => {
    const expansions = 1000000;
    const galaxies = findGalaxies(image);
    const galaxyPairs = uniqueGalaxyPairs(galaxies);
    const emptyRows = emptyRowIndexes(image);
    const emptyColumns = emptyRowIndexes(transpose(image));

    const galaxyDistances = galaxyPairs.map(([g1, g2]) => {
        const minX = Math.min(g1[0], g2[0]);
        const maxX = Math.max(g1[0], g2[0]);
        const minY = Math.min(g1[1], g2[1]);
        const maxY = Math.max(g1[1], g2[1]);

        const emptyRowsBetween = getEmpties(emptyRows, minY, maxY);
        const emptyColumnsBetween = getEmpties(emptyColumns, minX, maxX);
        const baseDistance = distance(g1, g2);

        const emptyRowsDistance =
            (emptyRowsBetween + emptyColumnsBetween) * (expansions - 1);

        return baseDistance + emptyRowsDistance;
    });

    const result = A.reduce(galaxyDistances, 0, N.add);

    return result;
};

const parse = (input: string[]): Tile[][] => {
    return input.map(line => line.split('') as Tile[]);
};

export const run = () => {
    const input = loadInput('2023-11');
    const image = parse(input);
    console.log(part1(image));
    console.log(part2(image));
};

const testInput1 = `
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....
`
    .trim()
    .split('\n');
