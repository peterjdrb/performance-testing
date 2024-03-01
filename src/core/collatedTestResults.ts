import { PerformanceEntry } from "perf_hooks"

import { numberOfRunsToExecute } from "../config";
import { TestResult } from "../types";

export const collatedTestResults = (results: PerformanceEntry[]): TestResult[] => {
  const uniqueFileNames = [...new Set(results.map((element) => element.name))];

  return uniqueFileNames.flatMap((name) => {
    const allRuns = results.filter((result) => result.name === name);

    const averageInMS =
      allRuns.reduce((acc, result) => {
        return acc + result.duration;
      }, 0) / numberOfRunsToExecute;

    return { name, averageInMS, timeRecorded: new Date().toISOString() };
  });
};