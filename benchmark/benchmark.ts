import fs from "fs";
import { performance, PerformanceObserver, PerformanceEntry } from "perf_hooks";

const numberOfRunsToExecute = 3;

const importFiles = async () => {
  const files = fs
    .readdirSync("./src/", { recursive: true })
    .filter((file) => (file as string).endsWith(".perf.test.ts"));

  const tests: Array<[string | Buffer, any]> = [];
  for (const file of files) {
    const importedTests = await import(`../src/${file}`);
    tests.push([file, importedTests.performanceTest]);
  }

  return tests;
};

const runPerformanceTests = (performanceTests: [string | Buffer, any][]) => {
  // Create a PerformanceObserver to collect performance entries
  const observer = new PerformanceObserver(() => {});
  observer.observe({ entryTypes: ["measure"], buffered: true });

  performanceTests.forEach(([file, performanceTest]) => {
    for (let i = 0; i < numberOfRunsToExecute; i++) {
      if (!performanceTest) {
        console.error(
          `Error in ${file}: performanceTest is not defined. Have you exported it?`
        );
        break;
      }
      // Measure the performance of the fibonacci function
      performance.mark("start");
      performanceTest();
      performance.mark("end");
      performance.measure(file as string, "start", "end");
    }
  });

  return performance.getEntriesByType("measure");
};

const colaltedTestResults = (results: PerformanceEntry[]) => {
  const uniqueFileNames = [...new Set(results.map((element) => element.name))];

  return uniqueFileNames.flatMap((name) => {
    const allRuns = results.filter((result) => result.name === name);

    const average =
      allRuns.reduce((acc, result) => {
        return acc + result.duration;
      }, 0) / numberOfRunsToExecute;

    return { name, average };
  });
};

const main = async () => {
  const performanceTests = await importFiles();
  const results = runPerformanceTests(performanceTests);
  const tabledResults = colaltedTestResults(results);

  console.table(tabledResults);
};

main();
