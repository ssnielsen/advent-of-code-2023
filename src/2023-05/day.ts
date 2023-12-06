import {A} from '@mobily/ts-belt';
import {loadRawInput} from '../util';

type Data = {
    seeds: number[];
    maps: Map[];
};

type Map = {
    from: string;
    to: string;
    ranges: Range[];
};

type Range = {
    destinationStart: number;
    sourceStart: number;
    length: number;
};

const getMap = (data: Data, from: string, to: string) => {
    const map = data.maps.find(map => map.from === from && map.to === to);

    if (!map) {
        throw new Error(`No map from ${from} to ${to}`);
    }

    return map;
};

const findRange = (ranges: Range[], source: number) => {
    return ranges.find(
        range =>
            range.sourceStart <= source &&
            source < range.sourceStart + range.length,
    );
};

const getDestination = (
    data: Data,
    from: string,
    to: string,
    source: number,
) => {
    const map = getMap(data, from, to);

    const range = findRange(map.ranges, source);

    if (!range) {
        return source;
    }

    return range.destinationStart + source - range.sourceStart;
};

const aperture = <T>(size: number, list: T[]): T[][] => {
    const result: T[][] = [];

    for (let i = 0; i < list.length - size + 1; i++) {
        result.push(list.slice(i, i + size));
    }

    return result;
};

const minimum = A.reduce(Number.MAX_VALUE, Math.min);

const chain = [
    'seed',
    'soil',
    'fertilizer',
    'water',
    'light',
    'temperature',
    'humidity',
    'location',
];

const chainPairs = aperture(2, chain) as [string, string][];
const chainPairsReversed = aperture(2, [...chain].reverse()) as [
    string,
    string,
][];

const findDestination = (
    data: Data,
    seeds: number[],
    chainPairs: [string, string][],
) => {
    const destination = [...chainPairs].reduce((seeds, [from, to], _, arr) => {
        return seeds.map(seed => {
            const result = getDestination(data, from, to, seed);
            return result;
        });
    }, seeds);

    return destination;
};

const part1 = (data: Data) => {
    const destinations = findDestination(data, data.seeds, chainPairs);

    const smallest = minimum(destinations);

    return smallest;
};

const part2 = (data: Data) => {
    const ranges = A.splitEvery(data.seeds, 2).flatMap(([seed, length]) => {
        return {
            from: seed,
            to: seed + length - 1,
        };
    });

    const reversedData: Data = {
        seeds: data.seeds,
        maps: data.maps.map(map => {
            return {
                from: map.to,
                to: map.from,
                ranges: map.ranges.map(range => {
                    return {
                        destinationStart: range.sourceStart,
                        sourceStart: range.destinationStart,
                        length: range.length,
                    };
                }),
            };
        }),
    };

    let location = 0;

    while (true) {
        const [seed] = findDestination(
            reversedData,
            [location],
            chainPairsReversed,
        );

        if (withinRange(ranges, seed)) {
            break;
        } else {
            location += 1;
        }
    }

    return location;
};

const withinRange = (ranges: {from: number; to: number}[], number: number) => {
    return ranges.some(range => {
        return range.from <= number && number <= range.to;
    });
};

const parse = (input: string) => {
    const [seedsText, ...mapsTexts] = input.split('\n\n');

    const seeds = seedsText
        .replace('seeds: ', '')
        .split(' ')
        .map(n => parseInt(n, 10));

    const maps = mapsTexts.map(mapText => {
        const [infoPart, ...rangesTexts] = mapText.split('\n');

        const [from, to] = infoPart
            .replace('-to-', '-')
            .replace(' map:', '')
            .split('-');

        const ranges = rangesTexts.map(rangeText => {
            const [destinationStart, sourceStart, length] = rangeText
                .split(' ')
                .map(n => parseInt(n, 10));

            return {
                destinationStart,
                sourceStart,
                length,
            };
        });

        return {
            from,
            to,
            ranges,
        };
    });

    return {
        seeds,
        maps,
    };
};

export const run = () => {
    const input = loadRawInput('2023-05');
    const data = parse(input);

    console.log(part1(data));
    console.log(part2(data));
};

const testInput = `
seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4
`.trim();
