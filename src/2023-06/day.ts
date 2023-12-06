import {A, N} from '@mobily/ts-belt';
import {loadRawInput} from '../util';

type Race = {
    time: number;
    distance: number;
};

const getDistance = (holdingTime: number, raceTime: number) => {
    const runTime = raceTime - holdingTime;

    return holdingTime * runTime;
};

const holdRace = (race: Race) => {
    return A.range(0, race.time - 1).map(holdTime => [
        holdTime,
        getDistance(holdTime, race.time),
    ]);
};

const product = A.reduce(1, N.multiply);

const part1 = (races: Race[]) => {
    const heldRaces = races
        .map(race => {
            const heldRace = holdRace(race);

            const filteredHeldRaces = heldRace.filter(
                ([, distance]) => distance > race.distance,
            );

            return filteredHeldRaces.map(([held]) => held);
        })
        .map(a => a.length);

    const result = product(heldRaces);

    return result;
};

const fastRace = (race: Race) => {
    let n = 0;

    while (true) {
        const result = getDistance(n, race.time);

        if (result > race.distance) {
            break;
        } else {
            n += 1;
        }
    }

    return race.time - 2 * n + 1;
};

const part2 = (races: Race[]) => {
    const newRace: Race = {
        distance: parseInt(races.map(race => race.distance).join(''), 10),
        time: parseInt(races.map(race => race.time).join(''), 10),
    };

    const result = fastRace(newRace);

    return result;
};

const getNumbers = (line: string) => {
    return line.match(/\d+/g)?.map(match => parseInt(match, 10));
};

const parse = (input: string) => {
    const [timePart, distancePart] = input.split('\n').map(getNumbers);

    return A.zip(timePart ?? [], distancePart ?? []).map(
        ([time, distance]) => ({time, distance}),
    );
};

export const run = () => {
    const input = loadRawInput('2023-06');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
};

const testInput = `
Time:      7  15   30
Distance:  9  40  200
`.trim();
