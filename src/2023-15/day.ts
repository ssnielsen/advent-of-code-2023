import {loadRawInput} from '../util';

const getAsciiCode = (input: string) => {
    return input.charCodeAt(0);
};

const hashChar = (currentValue: number, input: string) => {
    const afterAscii = currentValue + getAsciiCode(input);
    const afterMultiplying = afterAscii * 17;
    const afterRemainder = afterMultiplying % 256;

    return afterRemainder;
};

const hash = (input: string) => {
    return input.split('').reduce((acc, x) => hashChar(acc, x), 0);
};

const part1 = (data: string[]) => {
    return data.map(hash).reduce((acc, x) => acc + x, 0);
};

type Instruction =
    | {
          type: 'dash';
          label: string;
      }
    | {
          type: 'equal';
          label: string;
          focalLength: FocalLength;
      };

type Data = Instruction[];

type Label = string;
type FocalLength = number;
type Lens = [Label, FocalLength];
type Box = Lens[];
type State = Map<number, Box>;

const getFocusPower = (state: State) => {
    const focusPower = [...state.entries()]
        .flatMap(([boxNumber, box]) => {
            return box.map(([_, focalLength], index) => {
                return (boxNumber + 1) * (index + 1) * focalLength;
            });
        })
        .reduce((acc, curr) => acc + curr, 0);

    return focusPower;
};

const part2 = (data: string) => {
    const instructions = data.split(',').map(x => {
        if (x.includes('=')) {
            const [label, focalLength] = x.split('=');

            return {
                type: 'equal',
                label,
                focalLength: parseInt(focalLength, 10)!,
            } satisfies Instruction;
        } else {
            return {
                type: 'dash',
                label: x.replace('-', ''),
            } satisfies Instruction;
        }
    });

    const initialState = new Map<number, Box>();

    const endState = instructions.reduce((state, instruction) => {
        const boxNumber = hash(instruction.label);
        const box = state.get(boxNumber) ?? [];

        switch (instruction.type) {
            case 'dash':
                // Remove lens from box
                const removedFromBox = box.filter(
                    ([label]) => label !== instruction.label,
                );
                return state.set(boxNumber, removedFromBox);

            case 'equal':
                const lensLocation = box.findIndex(
                    lens => lens[0] === instruction.label,
                );

                if (lensLocation >= 0) {
                    box[lensLocation] = [
                        instruction.label,
                        instruction.focalLength,
                    ];
                    return state.set(boxNumber, box);
                } else {
                    return state.set(boxNumber, [
                        ...box,
                        [instruction.label, instruction.focalLength],
                    ]);
                }
        }
    }, initialState);

    const result = getFocusPower(endState);

    return result;
};

const printInstruction = (instruction: Instruction) => {
    switch (instruction.type) {
        case 'dash':
            console.log(`${instruction.label}-`);
            break;
        case 'equal':
            console.log(`${instruction.label}=${instruction.focalLength}`);
            break;
    }
};

const printState = (state: State) => {
    [...state.entries()]
        .sort((a, b) => a[0] - b[0])
        .filter(([_, box]) => box.length > 0)
        .forEach(([boxNumber, box]) => {
            const boxContents = box
                .map(([label, focalLength]) => `[${label} ${focalLength}]`)
                .join(' ');

            console.log(`Box: ${boxNumber}: ${boxContents}`);
        });
    console.log();
};

const parse = (input: string) => {
    return input.split(',');
};

export const run = () => {
    const input = loadRawInput('2023-15');
    const data = parse(testInput1);
    console.log(part1(data));
    console.log(part2(input));
};

const testInput1 = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`.trim();
