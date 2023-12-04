import {A, N} from '@mobily/ts-belt';
import {loadInput} from '../util';

type Card = {
    id: number;
    winningNumbers: number[];
    myNumbers: number[];
};

const sum = A.reduce(0, N.add);

const getPoints = (card: Card) => {
    return A.intersection(card.winningNumbers, card.myNumbers);
};

const part1 = (cards: Card[]) => {
    const overlaps = cards.map(card => {
        return {
            id: card.id,
            overlapping: getPoints(card),
        };
    });

    const points = overlaps.map(overlap => {
        if (overlap.overlapping.length === 0) {
            return 0;
        }

        return Math.pow(2, overlap.overlapping.length - 1);
    });

    const result = sum(points);

    return result;
};

const cache = new Map<number, number>();

const calculateCopies = (id: number, cards: Card[]): number => {
    if (cache.has(id)) {
        return cache.get(id)!;
    }

    const card = cards[id - 1];
    const points = getPoints(card);
    const copies = A.range(1, points.length).map(i => card.id + i);
    const result =
        copies.length + sum(copies.map(copy => calculateCopies(copy, cards)));

    cache.set(id, result);
    return result;
};

const part2 = (cards: Card[]) => {
    return (
        sum([...cards].reverse().map(card => calculateCopies(card.id, cards))) +
        cards.length
    );
};

const parse = (input: string[]) => {
    const cards = input.map(line => {
        const [idPart, numbersPart] = line.split(': ');

        const id = parseInt(idPart.replace('Card ', ''), 10);

        const [winningNumbers, myNumbers] = numbersPart
            .split(' | ')
            .map(numberParts => {
                return numberParts.split(' ').map(n => parseInt(n, 10));
            });

        return {
            id,
            winningNumbers,
            myNumbers,
        };
    });

    return cards;
};

export const run = () => {
    const input = loadInput('2023-04');
    const cards = parse(input);

    console.log(part1(cards));
    console.log(part2(cards));
};

const testInput = `
Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
`
    .trim()
    .split('\n');
