import { promises as fs } from "fs";
import { InterpretedResults } from "../types";
import { commandArgs } from "../config";

export const saveResults = (results: InterpretedResults) => {

  if (commandArgs().dryRun) {
    return;
  }

  const { improvedPerformance, newPerformanceResults, previousResults } =
    results;

  if (improvedPerformance.length >= 0 || newPerformanceResults.length >= 0) {
    const newResults = previousResults;
    newResults.push(...newPerformanceResults);
    improvedPerformance.forEach((result) => {
      const indexOfNewResults = newResults.findIndex(
        (res) => res.name === result.name
      );
      newResults[indexOfNewResults] = result;
    });

    //Save results
    fs.writeFile(
      "./benchmark/results.json",
      JSON.stringify(newResults, null, 2),
      "utf-8"
    );
  }
};