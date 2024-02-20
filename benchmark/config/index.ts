import { program } from 'commander';

const defaultThreshold = 0.1

const threashhold = (threshold: any) => {
    if (isNaN(threshold) || threshold >= 1 || threshold <= 0) {
        throw Error("Must be a decimal greater then 0 but less than 1.");
    }

    return threshold;
}

program
    .option('-d, --dry-run', 'Run the performance tests without saving the results to `benchmark/results.json`', false)
    .option('-t, --threshold <number>', 'integer argument', threashhold, defaultThreshold);

program.parse();
program.opts()

export const numberOfRunsToExecute = 3;
export const commandArgs = program.opts();