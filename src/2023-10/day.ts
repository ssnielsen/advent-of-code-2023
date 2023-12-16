import {A} from '@mobily/ts-belt';
import {loadInput} from '../util';

type Point = {
    x: number;
    y: number;
};
type StartingPoint = 'S';
type PipeTile = '─' | '│' | '└' | '┘' | '┐' | '┌';
type Tile = '.' | PipeTile | StartingPoint;
type Direction = 'up' | 'down' | 'left' | 'right';
type System = Tile[][];

const findStartingPoint = (system: System): Point => {
    let startingPoint: Point;
    system.forEach((line, y) => {
        line.forEach((tile, x) => {
            if (tile === 'S') {
                startingPoint = {x, y};
            }
        });
    });
    return startingPoint!;
};

const getNeighbors = (system: System, point: Point) => {
    const neighbors: {point: Point; direction: Direction}[] = [];
    const {x, y} = point;
    if (y > 0) {
        neighbors.push({point: {x, y: y - 1}, direction: 'up'});
    }
    if (y < system.length - 1) {
        neighbors.push({point: {x, y: y + 1}, direction: 'down'});
    }
    if (x > 0) {
        neighbors.push({point: {x: x - 1, y}, direction: 'left'});
    }
    if (x < system[0].length - 1) {
        neighbors.push({point: {x: x + 1, y}, direction: 'right'});
    }
    return neighbors;
};

const findStartingPointNeighbors = (system: System, point: Point) => {
    const neighbors = getNeighbors(system, point);

    return neighbors.filter(neighbor => {
        const neighborTile = system[neighbor.point.y][neighbor.point.x];

        switch (neighbor.direction) {
            case 'up':
                return ['│', '┐', '┌'].includes(neighborTile);
            case 'down':
                return ['│', '└', '┘'].includes(neighborTile);
            case 'left':
                return ['─', '└', '┌'].includes(neighborTile);
            case 'right':
                return ['─', '┐', '┘'].includes(neighborTile);
        }
    });
};

const nextStep = (
    system: System,
    point: Point,
    direction: Direction,
): {point: Point; direction: Direction} => {
    const tile = system[point.y][point.x] as PipeTile;

    switch (tile) {
        case '└':
            switch (direction) {
                case 'down':
                    return {
                        point: {x: point.x + 1, y: point.y},
                        direction: 'right',
                    };
                case 'left':
                    return {
                        point: {x: point.x, y: point.y - 1},
                        direction: 'up',
                    };
            }
        case '┘':
            switch (direction) {
                case 'down':
                    return {
                        point: {x: point.x - 1, y: point.y},
                        direction: 'left',
                    };
                case 'right':
                    return {
                        point: {x: point.x, y: point.y - 1},
                        direction: 'up',
                    };
            }
        case '┐':
            switch (direction) {
                case 'up':
                    return {
                        point: {x: point.x - 1, y: point.y},
                        direction: 'left',
                    };
                case 'right':
                    return {
                        point: {x: point.x, y: point.y + 1},
                        direction: 'down',
                    };
            }
        case '┌':
            switch (direction) {
                case 'up':
                    return {
                        point: {x: point.x + 1, y: point.y},
                        direction: 'right',
                    };
                case 'left':
                    return {
                        point: {x: point.x, y: point.y + 1},
                        direction: 'down',
                    };
            }
        case '─':
            switch (direction) {
                case 'left':
                    return {
                        point: {x: point.x - 1, y: point.y},
                        direction: 'left',
                    };
                case 'right':
                    return {
                        point: {x: point.x + 1, y: point.y},
                        direction: 'right',
                    };
            }
        case '│':
            switch (direction) {
                case 'up':
                    return {
                        point: {x: point.x, y: point.y - 1},
                        direction: 'up',
                    };
                case 'down':
                    return {
                        point: {x: point.x, y: point.y + 1},
                        direction: 'down',
                    };
            }
    }

    throw new Error(
        'Invalid tile / direction combination ' + tile + ' ' + direction,
    );
};

const printSystem = (system: System) => {
    system.forEach(line => console.log(line.join('')));
};

const copySystem = (system: System) => {
    return system.map(line => [...line]);
};

const followPath = (
    system: System,
    point: Point,
    direction: Direction,
    stopFunction: (point: Point) => boolean,
): Point[] => {
    let path = [];
    let currentPoint = point;

    while (!stopFunction(currentPoint)) {
        const nextPoint = nextStep(system, currentPoint, direction);
        path.push(nextPoint.point);
        currentPoint = nextPoint.point;
        direction = nextPoint.direction;
    }

    return path;
};

const part1 = (system: System) => {
    const startingPoint = findStartingPoint(system);
    const nextPoints = findStartingPointNeighbors(system, startingPoint);

    const path = followPath(
        system,
        nextPoints[0].point,
        nextPoints[0].direction,
        point => system[point.y][point.x] === 'S',
    );

    return Math.ceil(path.length / 2);
};

// Shoelace formula
// From: https://www.geeksforgeeks.org/area-of-a-polygon-with-given-n-ordered-vertices/
function polygonArea(X: number[], Y: number[], n: number) {
    // Initialize area
    let area = 0.0;

    // Calculate value of shoelace formula
    let j = n - 1;
    for (let i = 0; i < n; i++) {
        area += (X[j] + X[i]) * (Y[j] - Y[i]);

        // j is previous vertex to i
        j = i;
    }

    // Return absolute value
    return Math.abs(area / 2.0);
}

const picksTheorem = (b: number, A: number) => {
    return A - b / 2 + 1;
};

const part2 = (system: System) => {
    const startingPoint = findStartingPoint(system);
    const nextPoints = findStartingPointNeighbors(system, startingPoint);

    const path1 = followPath(
        system,
        nextPoints[0].point,
        nextPoints[0].direction,
        point => system[point.y][point.x] === 'S',
    );

    const filterdPath = [...path1].filter(point => {
        if (['└', '┘', '┐', '┌'].includes(system[point.y][point.x])) {
            return true;
        }
        return false;
    });

    const pairs = filterdPath.map(point => [point.x, point.y] as const);

    const [xs, ys] = A.unzip(pairs) as [number[], number[]];

    const area = polygonArea(xs, ys, xs.length);

    return Math.floor(picksTheorem(path1.length, area));
};

const parse = (lines: string[]) => {
    const realPipes = lines.map(line =>
        line.split('').map(tile => {
            switch (tile) {
                case 'J':
                    return '┘';
                case 'L':
                    return '└';
                case 'F':
                    return '┌';
                case '7':
                    return '┐';
                case '|':
                    return '│';
                case '-':
                    return '─';
                default:
                    return tile;
            }
        }),
    );

    return realPipes as System;
};

export const run = () => {
    const input = loadInput('2023-10');
    const data = parse(input);
    console.log(part1(data));
    console.log(part2(data));
};

const testInput0 = `
.....
.S-7.
.|.|.
.L-J.
.....`
    .trim()
    .split('\n');

const testInput1 = `
-L|F7
7S-7|
L|7||
-L-J|
L|-JF
`
    .trim()
    .split('\n');

const testInput2 = `
..F7.
.FJ|.
SJ.L7
|F--J
LJ...
`
    .trim()
    .split('\n');

const testInput3 = `
7-F7-
.FJ|7
SJLL7
|F--J
LJ.LJ
`
    .trim()
    .split('\n');

const testInput4 = `
...........
.S-------7.
.|F-----7|.
.||OOOOO||.
.||OOOOO||.
.|L-7OF-J|.
.|II|O|II|.
.L--JOL--J.
.....O.....
`
    .trim()
    .split('\n');

const testInput5 = `
..........
.S------7.
.|F----7|.
.||OOOO||.
.||OOOO||.
.|L-7F-J|.
.|II||II|.
.L--JL--J.
..........
`
    .trim()
    .split('\n');
