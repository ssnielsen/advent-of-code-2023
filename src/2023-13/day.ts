import {A, pipe} from '@mobily/ts-belt';
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

const isIdenticalRows = <T>(row1: T[], row2: T[]) => {
    return pipe(
        A.zip(row1, row2),
        A.every(([a, b]) => a === b),
    );
};

const buildReflectionRange = (size: number, index: number) => {
    const before = A.reverse(A.range(0, index));
    const after = A.range(index + 1, size - 1);

    const smallest = Math.min(before.length, after.length);

    const result = A.zip(A.take(before, smallest), A.take(after, smallest));

    return result;
};

const hasReflection = (rows: Tile[][]) => {
    return pipe(
        rows,
        A.mapWithIndex(index => {
            if (index === rows.length - 1) {
                return null;
            }

            const reflectionMap = buildReflectionRange(rows.length, index);

            const hasReflection = reflectionMap.every(([index1, index2]) => {
                const isIdentical = isIdenticalRows(rows[index1], rows[index2]);

                if (isIdentical) {
                    console.log(reflectionMap);
                    console.log('identical', index1, index2);
                    console.log(rows[index1].join(''));
                    console.log(rows[index2].join(''));
                }

                return isIdentical;
            });

            return hasReflection ? index : null;
        }),
        A.filter(hasValue),
        A.head,
    );
};

const hasValue = <T>(candidate: T | undefined | null): candidate is T => {
    return candidate !== undefined && candidate !== null;
};

const indexOfReflection = (grid: Grid) => {
    const transposed = transpose(grid);

    printGrid(grid);
    printGrid(transposed);

    const horizontalReflection = hasReflection(grid);
    const verticalReflection = hasReflection(transposed);

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

const part1 = (grids: Grid[]) => {
    const result = grids
        .map(grid => {
            const index = indexOfReflection(grid);

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
    console.log(part1(A.take(data, data.length) as Grid[]));
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
