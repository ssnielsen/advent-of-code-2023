import {A, N} from '@mobily/ts-belt';
import {loadInput} from '../util';

type Card =
    | 'A'
    | 'K'
    | 'Q'
    | 'J'
    | 'T'
    | '9'
    | '8'
    | '7'
    | '6'
    | '5'
    | '4'
    | '3'
    | '2';

let isPart2 = false;

const getCardValue = (card: Card) => {
    switch (card) {
        case 'A':
            return 14;
        case 'K':
            return 13;
        case 'Q':
            return 12;
        case 'J':
            return isPart2 ? 1 : 11;
        case 'T':
            return 10;
        default:
            return parseInt(card, 10);
    }
};

type HandType =
    | 'five-of-a-kind'
    | 'four-of-a-kind'
    | 'full-house'
    | 'three-of-a-kind'
    | 'two-pairs'
    | 'one-pair'
    | 'high-card';

const getHandStrength = (handType: HandType) => {
    switch (handType) {
        case 'five-of-a-kind':
            return 9;
        case 'four-of-a-kind':
            return 8;
        case 'full-house':
            return 7;
        case 'three-of-a-kind':
            return 6;
        case 'two-pairs':
            return 5;
        case 'one-pair':
            return 4;
        case 'high-card':
            return 3;
    }
};

type Hand = {
    originalCards: [Card, Card, Card, Card, Card];
    cards: [Card, Card, Card, Card, Card];
    bid: number;
};

const sortHand = (cards: Hand['cards']): Hand['cards'] => {
    return A.sort(
        cards,
        (a, b) => getCardValue(b) - getCardValue(a),
    ) as Hand['cards'];
};

const areAllSame = (cards: Card[]) => {
    return A.all(cards, card => card === cards[0]);
};

const isFiveOfAKind = (hand: Hand) => {
    return areAllSame(hand.cards);
};

const aperture = <T>(n: number, list: T[]): T[][] => {
    return A.range(0, list.length - n).map(i => list.slice(i, i + n));
};

const isFourOfAKind = (hand: Hand) => {
    const [firstFour, lastFour] = aperture(4, hand.cards);

    return areAllSame(firstFour) || areAllSame(lastFour);
};

const isFullHouse = (hand: Hand) => {
    const [firstThree, lastTwo] = [
        A.take(hand.cards, 3),
        A.drop(hand.cards, 3),
    ];
    const [firstTwo, lastThree] = [
        A.take(hand.cards, 2),
        A.drop(hand.cards, 2),
    ];

    return (
        (areAllSame(firstThree as Card[]) &&
            areAllSame(lastTwo as Card[]) &&
            firstThree[0] !== lastTwo[0]) ||
        (areAllSame(firstTwo as Card[]) &&
            areAllSame(lastThree as Card[]) &&
            firstTwo[0] !== lastThree[0])
    );
};

const isThreeOfAKind = (hand: Hand) => {
    const [firstThree, middleThree, lastThree] = aperture(3, hand.cards);

    const result =
        areAllSame(firstThree) ||
        areAllSame(middleThree) ||
        areAllSame(lastThree);

    return result;
};

const isTwoPairs = (hand: Hand) => {
    const pairs = aperture(2, hand.cards);

    return pairs.filter(areAllSame).length === 2;
};

const isOnePair = (hand: Hand) => {
    const pairs = aperture(2, hand.cards);

    return pairs.filter(areAllSame).length === 1;
};

const calculateHand = (hand: Hand): HandType => {
    if (isFiveOfAKind(hand)) {
        return 'five-of-a-kind';
    }

    if (isFourOfAKind(hand)) {
        return 'four-of-a-kind';
    }

    if (isFullHouse(hand)) {
        return 'full-house';
    }

    if (isThreeOfAKind(hand)) {
        return 'three-of-a-kind';
    }

    if (isTwoPairs(hand)) {
        return 'two-pairs';
    }

    if (isOnePair(hand)) {
        return 'one-pair';
    }

    return 'high-card';
};

type ComputedHand = Hand & {
    handType: HandType;
};

const compareHands = (hand1: ComputedHand, hand2: ComputedHand) => {
    const hand1Strength = getHandStrength(hand1.handType);
    const hand2Strength = getHandStrength(hand2.handType);

    if (hand1Strength > hand2Strength) {
        return -1;
    }

    if (hand1Strength < hand2Strength) {
        return 1;
    }

    const pairs = A.zip(hand1.originalCards, hand2.originalCards);

    const [card1, card2] = pairs.find(([card1, card2]) => card1 !== card2)!;

    return getCardValue(card2) - getCardValue(card1);
};

const part1 = (hands: Hand[]) => {
    const calculatedHands = hands.map(hand => ({
        ...hand,
        handType: calculateHand(hand),
    }));

    const sortedHands = A.sort(calculatedHands, (hand1, hand2) => {
        return compareHands(hand1, hand2);
    });

    const reversedHands = [...sortedHands].reverse();

    // reversedHands.forEach(hand => {
    //     console.log(hand.originalCards.join(''), hand.bid);
    // });

    const scoredHands = reversedHands.map(
        (hand, index) => hand.bid * (index + 1),
    );

    const result = A.reduce(scoredHands, 0, (a, b) => {
        return a + b;
    });

    return result;
};

const replaceJokers = (hand: Hand): Hand => {
    const countCards = Object.entries(
        hand.cards.reduce((acc, card) => {
            return {
                ...acc,
                [card]: (acc[card] ?? 0) + 1,
            };
        }, {} as Record<Card, number>),
    )
        .sort(([, count1], [, count2]) => {
            return count2 - count1;
        })
        .filter(([card]) => card !== 'J');

    const replacingCard =
        countCards.length === 0 ? 'A' : (countCards[0][0] as Card);

    const newHand = hand.cards.map(card =>
        card === 'J' ? replacingCard : card,
    ) as Hand['cards'];

    const newSortedHand = sortHand(newHand);

    return {
        ...hand,
        cards: newSortedHand,
    };
};

const part2 = (hands: Hand[]) => {
    const newHands = hands.map(hand => replaceJokers(hand));

    return part1(newHands);
};

const parse = (lines: string[]) => {
    return lines.map(line => {
        const [cards, bidString] = line.split(' ');

        return {
            originalCards: cards.split('') as Hand['originalCards'],
            cards: sortHand(cards.split('') as Hand['cards']),
            bid: parseInt(bidString, 10),
        };
    });
};

export const run = () => {
    const input = loadInput('2023-07');
    const data = parse(input);

    console.log(part1(data));
    isPart2 = true;
    console.log(part2(data));
};

const testInput1 = `
32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483

`
    .trim()
    .split('\n');

// From: https://www.reddit.com/r/adventofcode/comments/18cr4xr/2023_day_7_better_example_input_not_a_spoiler/
const testInput2 = `
2345A 1
Q2KJJ 13
Q2Q2Q 19
T3T3J 17
T3Q33 11
2345J 3
J345A 2
32T3K 5
T55J5 29
KK677 7
KTJJT 34
QQQJA 31
JJJJJ 37
JAAAA 43
AAAAJ 59
AAAAA 61
2AAAA 23
2JJJJ 53
JJJJ2 41`
    .trim()
    .split('\n');
