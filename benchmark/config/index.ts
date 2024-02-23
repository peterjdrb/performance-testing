import { Command } from "@commander-js/extra-typings";

const defaultThreshold = 0.1;

const threashhold = (threshold: any): number => {
  if (isNaN(threshold) || threshold >= 1 || threshold <= 0) {
    throw Error(
      "Must be a value greater than 0 but less than 1. For example, if you want the threshold to be 5%, then pass in `--noticeableThreshold=0.05`"
    );
  }

  return threshold;
};

const program = new Command()
  .option(
    "-d, --dry-run",
    "Run the performance tests without saving the results to `benchmark/results.json`",
    false
  )
  .option(
    "-t, --threshold <number>",
    "Must be a value greater than 0 but less than 1. For example, if you want the threshold to be 5%, then pass in `--noticeableThreshold=0.05`",
    threashhold,
    defaultThreshold
  )
  .parse();

export const numberOfRunsToExecute = 3;
export const commandArgs =  program.opts();
