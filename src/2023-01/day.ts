import {A, pipe} from '@mobily/ts-belt';
import {loadInput} from '../util';

const numbers = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
};

const reverseString = (s: string) => s.split('').reverse().join('');

const numbersReversed = Object.fromEntries(
    Object.entries(numbers).map(([word, number]) => [
        reverseString(word),
        number,
    ]),
);

const regexFront = /one|two|three|four|five|six|seven|eight|nine|\d/g;
const regexBack = /eno|owt|eerht|ruof|evif|xis|neves|thgie|enin|\d/g;

const findFirstNumberPart2 = (word: string, direction: 'front' | 'back') => {
    const match =
        direction === 'front'
            ? word.match(regexFront)
            : reverseString(word).match(regexBack);

    if (!match) {
        return null;
    }

    const matched = match[0];

    if (!matched) {
        throw new Error(`Could not find a number in word: ${word}`);
    }

    const candidates = direction === 'front' ? numbers : numbersReversed;
    const foundNumber = candidates[matched as keyof typeof candidates];

    if (!foundNumber) {
        return parseInt(matched, 10);
    } else {
        return foundNumber;
    }
};

const findFirstNumberPart1 = (line: string, direction: 'front' | 'back') => {
    const match = (direction === 'front' ? line : reverseString(line)).match(
        /\d/,
    );
    if (match) {
        return parseInt(match[0], 10);
    }
    return null;
};

const getCalibrationNumber =
    (f: (line: string, direction: 'front' | 'back') => number | null) =>
    (line: string) => {
        const firstNumber = f(line, 'front');
        const lastNumber = f(line, 'back');

        if (firstNumber === null || lastNumber === null) {
            throw new Error(`Could not find a number in line: ${line}`);
        }

        return firstNumber * 10 + lastNumber;
    };

const sum = A.reduce<number, number>(0, (a, b) => a + b);

const part1 = (input: string[]) => {
    return pipe(A.map(input, getCalibrationNumber(findFirstNumberPart1)), sum);
};

const part2 = (input: string[]) => {
    return pipe(A.map(input, getCalibrationNumber(findFirstNumberPart2)), sum);
};

export const run = () => {
    const input = loadInput('2023-01');

    console.log(part1(input));
    console.log(part2(input));
};

const testInputPart1 = `1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet`
    .trim()
    .split('\n');

const testInputPart2 = `two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen`
    .trim()
    .split('\n');
