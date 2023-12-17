import {loadInput} from '../util';

const OPERATIONAL = '.';
const DAMAGED = '#';
const UNKNOWN = '?';

type Status = typeof OPERATIONAL | typeof DAMAGED | typeof UNKNOWN;
type SpringRow = Status[];
type DamageInformation = number[];
type Row = {
    row: SpringRow;
    damaged: DamageInformation;
};

const part1 = (input: Row[]) => {
    return 0;
};

const parse = (input: string[]) => {
    return input.map(line => {
        const [rowPart, damagedPart] = line.split(' ');

        const row = rowPart.split('') as SpringRow;
        const damaged = damagedPart.split(',').map(Number) as DamageInformation;

        return {row, damaged};
    });
};

export const run = () => {
    const input = loadInput('2023-12');
    const data = parse(input);
    console.log(part1(data));
};
