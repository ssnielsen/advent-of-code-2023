import {A, N, pipe} from '@mobily/ts-belt';
import {loadInput} from '../util';

type Draw = {
    green?: number;
    blue?: number;
    red?: number;
};

type Game = {
    id: number;
    draws: Draw[];
};

type Input = Game[];

const parse = (input: string[]) => {
    const output = input.map(line => {
        const [gamePart, drawPart] = line.split(': ');

        const id = Number(gamePart.split(' ')[1]);

        const draws = drawPart.split('; ').map(draw => {
            return Object.fromEntries(
                draw.split(', ').map(info => {
                    const [count, color] = info.split(' ');

                    return [color, Number(count)] as const;
                }),
            ) as Draw;
        });

        return {id, draws};
    });

    return output;
};

const findValidGames = (games: Input, configuration: Required<Draw>) => {
    return games.filter(game => {
        return game.draws.every(draw => {
            return (
                (draw.blue ?? 0) <= configuration.blue &&
                (draw.green ?? 0) <= configuration.green &&
                (draw.red ?? 0) <= configuration.red
            );
        });
    });
};

const sum = A.reduce<number, number>(0, (a, b) => a + b);

const part1 = (input: Input) => {
    return pipe(
        input,
        input => findValidGames(input, {green: 13, blue: 14, red: 12}),
        A.map(game => game.id),
        sum,
    );
};

const extractColor = (draws: Draw[], color: keyof Draw) => {
    return pipe(
        draws,
        A.map(draw => draw[color] ?? 0),
        A.reduce(0, Math.max),
    );
};

const minimumGame = (game: Game) => {
    const [red, green, blue] = [
        extractColor(game.draws, 'red'),
        extractColor(game.draws, 'green'),
        extractColor(game.draws, 'blue'),
    ];

    return red * green * blue;
};

const part2 = (input: Input) => {
    return input.map(game => minimumGame(game)).reduce(N.add, 0);
};

export const run = () => {
    const input = loadInput('2023-02');
    const games = parse(input);

    console.log(part1(games));
    console.log(part2(games));
};

const prettyPrint = (input: object) => {
    console.log(JSON.stringify(input, null, 2));
};

const testInputPart1 = `
Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`
    .trim()
    .split('\n');
