import {loadInput} from '../util';

type Instruction = 'R' | 'L';

type Node = {
    label: string;
    left: string;
    right: string;
};

const followInstructions = (
    instructions: Instruction[],
    nodes: Node[],
    startingNode: string,
    hasReachedGoal: (label: string) => boolean,
    initialSteps: number = 0,
) => {
    const result = [...instructions].reduce(
        (acc, instruction) => {
            if (hasReachedGoal(acc.currentLabel)) {
                return acc;
            }

            const node = nodes.find(node => node.label === acc.currentLabel);

            if (!node) {
                throw new Error(`No node with label ${acc}`);
            }

            if (instruction === 'R') {
                return {
                    currentLabel: node.right,
                    steps: acc.steps + 1,
                };
            } else {
                return {
                    currentLabel: node.left,
                    steps: acc.steps + 1,
                };
            }
        },
        {
            currentLabel: startingNode,
            steps: initialSteps,
        },
    );

    return result;
};

const followUntilDone = (
    instructions: Instruction[],
    nodes: Node[],
    startingNode: string,
    hasReachedGoal: (label: string) => boolean,
) => {
    let node = startingNode;
    let steps = 0;

    while (true) {
        const {currentLabel, steps: _steps} = followInstructions(
            instructions,
            nodes,
            node,
            hasReachedGoal,
            steps,
        );

        node = currentLabel;
        steps = _steps;

        if (hasReachedGoal(node)) {
            break;
        }
    }

    return steps;
};

const part1 = (instructions: Instruction[], nodes: Node[]) => {
    return followUntilDone(instructions, nodes, 'AAA', label =>
        label.endsWith('ZZZ'),
    );
};

const gcd = (a: number, b: number): number => {
    if (b === 0) {
        return a;
    }

    return gcd(b, a % b);
};

const lcm = (a: number, b: number) => {
    return (a * b) / gcd(a, b);
};

const leastCommonMultiple = (numbers: number[]) => {
    return numbers.reduce((acc, number) => lcm(acc, number));
};

const part2 = (instructions: Instruction[], nodes: Node[]) => {
    const startingNodes = nodes.filter(node => node.label.endsWith('A'));

    const stepsForStartingNodes = startingNodes.map(node => {
        const steps = followUntilDone(instructions, nodes, node.label, label =>
            label.endsWith('Z'),
        );

        return steps;
    });

    const result = leastCommonMultiple(stepsForStartingNodes);

    return result;
};

const parse = (input: string[]) => {
    const [_instructions, _, ..._nodes] = input;

    const instructions = _instructions.split('') as Instruction[];

    const nodes = _nodes.map(node => {
        const [label, left, right] = node.split(/[^A-Z0-9]+/);

        return {
            label,
            left,
            right,
        };
    });

    return {
        instructions,
        nodes,
    };
};

export const run = () => {
    const input = loadInput('2023-08');
    const {instructions, nodes} = parse(input);

    console.log(part1(instructions, nodes));
    console.log(part2(instructions, nodes));
};

const testInput1 = `
RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)
`
    .trim()
    .split('\n');

const testInput2 = `
LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)
`
    .trim()
    .split('\n');

const testInput3 = `
LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)
`
    .trim()
    .split('\n');
