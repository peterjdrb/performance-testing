// ------------------------------- NODE MODULES -------------------------------

import { importFiles } from "./core/importFiles";
import { runPerformanceTests } from "./core/runPerformanceTests";
import { collatedTestResults } from "./core/collatedTestResults";
import { interpretResults } from "./core/interpretResults";
import { outputResults } from "./core/outputResults";
import { saveResults } from "./core/saveResults";

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------



// ----------------------------- FILE DEFINITION ------------------------------

const main = async () => {
  const performanceTests = await importFiles();

  if (performanceTests.length > 0) {
    const results = await runPerformanceTests(performanceTests);
    const tabledResults = collatedTestResults(results);
    const interpretedResults = await interpretResults(tabledResults);
    outputResults(interpretedResults);
    saveResults(interpretedResults);
    return;
  }

  console.warn("No performance test files have been detected. Do your performance test files end in .perf.test.ts?")

};

main();
