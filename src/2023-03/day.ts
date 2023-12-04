import {A, N} from '@mobily/ts-belt';
import {loadInput} from '../util';

type Grid = string[][];

type Point = [number, number];

const scanNumbers = (grid: Grid): [number, Point[]][] => {
    const numbers: [number, Point[]][] = [];
    for (let y = 0; y < grid.length; y++) {
        const row = grid[y];

        const result = row.join('').matchAll(/\d+/g);

        if (result) {
            [...result].forEach(result => {
                numbers.push([
                    parseInt(result[0]),
                    A.range(
                        result.index!,
                        result.index! + result[0].length - 1,
                    ).map(deltaX => {
                        return [deltaX, y];
                    }),
                ]);
            });
        }
    }
    return numbers;
};

const surroundingPoints = (point: Point): Point[] => {
    const [x, y] = point;
    return [
        [x - 1, y - 1],
        [x, y - 1],
        [x + 1, y - 1],

        [x - 1, y],
        [x + 1, y],

        [x - 1, y + 1],
        [x, y + 1],
        [x + 1, y + 1],
    ];
};

const hasSymbol = (grid: Grid, candidate: [number, Point[]]) => {
    const around = candidate[1].flatMap(point => surroundingPoints(point));

    return around.some(([x, y]) => {
        return grid[y]?.[x]?.match(/[^\d^\.]/);
    });
};

const hasValue = <T>(candidate: T | null | undefined): candidate is T => {
    return candidate !== null && candidate !== undefined;
};

const allSurroundingStars = (grid: Grid, candidate: [number, Point[]]) => {
    const around = candidate[1].flatMap(point => surroundingPoints(point));

    const surroundingStars = around
        .map(([x, y]) => {
            const symbol = grid[y]?.[x]?.match(/\*/);

            if (!symbol) {
                return null;
            }

            return {x, y};
        })
        .filter(hasValue);

    return surroundingStars;
};

const prettyPrint = (o: object) => {
    console.log(JSON.stringify(o, null, 2));
};

const sum = A.reduce(0, N.add);

const part1 = (grid: Grid) => {
    const numbers = scanNumbers(grid);
    const validNumbers = numbers.filter(candidate =>
        hasSymbol(grid, candidate),
    );

    const validPartNumbers = validNumbers.map(([number]) => number);
    const result = sum(validPartNumbers);

    return result;
};

const pivot = (numbers: [number, {x: number; y: number}][]) => {
    return numbers.reduce((acc, [number, {x, y}]) => {
        return {
            ...acc,
            [`${x}_${y}`]: [...(acc[`${x}_${y}` as string] ?? []), number],
        };
    }, {} as Record<string, number[]>);
};

const part2 = (grid: Grid) => {
    const numbers = scanNumbers(grid);
    const numbersWithStars = numbers
        .map(candidate => {
            const surroundingStars = allSurroundingStars(grid, candidate);

            if (surroundingStars.length === 0) {
                return null;
            }

            return [candidate[0], surroundingStars[0]] as const;
        })
        .filter(hasValue) as Parameters<typeof pivot>[0];

    const pivoted = pivot(numbersWithStars);
    const onlyTwo = Object.values(pivoted).filter(
        numbers => numbers.length === 2,
    );
    const multiplied = onlyTwo.map(([a, b]) => a * b);
    const result = sum(multiplied);

    return result;
};

const parse = (input: string[]) => {
    return input.map(line => line.split(''));
};

export const run = () => {
    const input = loadInput('2023-03');
    const grid = parse(input);

    console.log(part1(grid));
    console.log(part2(grid));
};

const testInput = `
467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..
`
    .trim()
    .split('\n');
