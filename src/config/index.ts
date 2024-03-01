import { Command } from "@commander-js/extra-typings";
import fs from "fs";

const defaultThreshold = 0.1;
const defaultOutputDir = "./benchmark/results.json";

const threashhold = (threshold: any): number => {
  if (isNaN(threshold) || threshold >= 1 || threshold <= 0) {
    throw Error(
      "Must be a value greater than 0 but less than 1. For example, if you want the threshold to be 5%, then pass in `--noticeableThreshold=0.05`"
    );
  }

  return threshold;
};

const outputDir = (dir: string) => {
  if (!dir.endsWith('.json')) {
    dir = `${dir}/results.json`
  }

  return dir
}

const program = new Command()
  .option(
    "-d, --dry-run",
    "Run the performance tests without saving the results to the desired output location",
    false
  )
  .option(
    "-t, --threshold <number>",
    "Must be a value greater than 0 but less than 1. For example, if you want the threshold to be 5%, then pass in `--noticeableThreshold=0.05`",
    threashhold,
    defaultThreshold
  )
  .option(
    "-o, --outputDir <string>",
    "Saves the output from the perforance testing to the provided location. If you do not include a json file in the directory, then a results.json file will be used in the provided directory",
    outputDir,
    defaultOutputDir
  ).action(({ outputDir }) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir.slice(0, outputDir.lastIndexOf('/')), {recursive: true});
      fs.writeFileSync(outputDir, JSON.stringify([]));
    }
  })
  .parse();

export const numberOfRunsToExecute = 3;
export const commandArgs = program.opts();
