import {A, N, pipe} from '@mobily/ts-belt';
import {loadRawInput} from '../util';

const ASH = '.';
const ROCK = '#';
type Tile = typeof ASH | typeof ROCK;
type Grid = Tile[][];

const transpose = <T>(grid: T[][]) => {
    const result: T[][] = [];
    for (let i = 0; i < grid[0].length; i++) {
        result.push(grid.map(row => row[i]));
    }
    return result;
};

const sum = A.reduce(0, N.add);

const sumDistance = <T>(row1: T[], row2: T[]) => {
    return pipe(
        A.zip(row1, row2),
        A.map(([a, b]) => (a === b ? 0 : 1)),
        sum,
    );
};

const buildReflectionRange = (size: number, index: number) => {
    const result = A.zip(
        A.reverse(A.range(0, index)),
        A.range(index + 1, size - 1),
    );

    return result;
};

const hasReflection = (rows: Tile[][], matchDistance: number) => {
    return pipe(
        rows,
        A.mapWithIndex(index => {
            if (index === rows.length - 1) {
                return null;
            }

            const reflectionMap = buildReflectionRange(rows.length, index);

            const totalDistance = pipe(
                reflectionMap,
                A.map(([index1, index2]) => {
                    return sumDistance(rows[index1], rows[index2]);
                }),
                sum,
            );

            return totalDistance === matchDistance ? index : null;
        }),
        A.filter(hasValue),
        A.head,
    );
};

const hasValue = <T>(candidate: T | undefined | null): candidate is T => {
    return candidate !== undefined && candidate !== null;
};

const indexOfReflection = (grid: Grid, matchDistance: number) => {
    const transposed = transpose(grid);

    const horizontalReflection = hasReflection(grid, matchDistance);
    const verticalReflection = hasReflection(transposed, matchDistance);

    if (hasValue(horizontalReflection)) {
        return {type: 'horizontal', index: horizontalReflection};
    } else if (hasValue(verticalReflection)) {
        return {type: 'vertical', index: verticalReflection};
    } else {
        return null;
    }
};

const printGrid = (grid: Grid) => {
    grid.forEach(row => {
        console.log(row.join(''));
    });
    console.log();
};

const calculate = (grids: Grid[], matchDistance: number) => {
    const result = grids
        .map(grid => {
            const index = indexOfReflection(grid, matchDistance);

            switch (index?.type) {
                case 'horizontal':
                    return (index.index + 1) * 100;
                case 'vertical':
                    return index.index + 1;
                default:
                    return 0;
            }
        })
        .reduce((acc, curr) => acc + curr, 0);

    return result;
};

const part1 = (grids: Grid[]) => {
    return calculate(grids, 0);
};

const part2 = (grids: Grid[]) => {
    return calculate(grids, 1);
};

const parse = (input: string) => {
    const gridsData = input.split('\n\n');

    const grids = gridsData.map(gridData => {
        const rows = gridData.split('\n');
        const grid = rows.map(row => row.split('') as Tile[]);
        return grid;
    });

    return grids;
};

export const run = () => {
    const input = loadRawInput('2023-13');
    const data = parse(input);
    console.log(part1(data));
    console.log(part2(data));
};

const testInput1 = `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#
`.trim();

const testInput2 = `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#

.#.##.#.#
.##..##..
.#.##.#..
#......##
#......##
.#.##.#..
.##..##.#

#..#....#
###..##..
.##.#####
.##.#####
###..##..
#..#....#
#..##...#

#.##..##.
..#.##.#.
##..#...#
##...#..#
..#.##.#.
..##..##.
#.#.##.#.
`.trim();
