// ------------------------------- NODE MODULES -------------------------------

import { promises as fs } from "fs";
import { performance, PerformanceObserver, PerformanceEntry } from "perf_hooks";

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

interface TestResult {
  name: string;
  averageInMS: number;
  timeImproved: string;
}

interface PerformanceDiff extends TestResult {
  percentageChange?: string;
}

const numberOfRunsToExecute = 3;
const noticeableThreshold = 0.5;

// ----------------------------- FILE DEFINITION ------------------------------

const importFiles = async () => {
  let files = await fs.readdir("./src/", { recursive: true });
  files = files.filter((file) => (file as string).endsWith(".perf.test.ts"));

  const tests: Array<[string | Buffer, any]> = [];
  for (const file of files) {
    const importedTests = await import(`../src/${file}`);
    tests.push([`src\\${file}`, importedTests.performanceTest]);
  }

  return tests;
};

const runPerformanceTests = (performanceTests: [string | Buffer, any][]) => {
  // Create a PerformanceObserver to collect performance entries
  const observer = new PerformanceObserver(() => {});
  observer.observe({ entryTypes: ["measure"], buffered: true });

  for (const fileIndex in performanceTests) {
    const [file, performanceTest] = performanceTests[fileIndex];
    console.log(
      `Running performance test ${Number(fileIndex) + 1} of ${
        performanceTests.length
      }`
    );

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
  }

  return performance.getEntriesByType("measure");
};

const collatedTestResults = (results: PerformanceEntry[]): TestResult[] => {
  const uniqueFileNames = [...new Set(results.map((element) => element.name))];

  return uniqueFileNames.flatMap((name) => {
    const allRuns = results.filter((result) => result.name === name);

    const averageInMS =
      allRuns.reduce((acc, result) => {
        return acc + result.duration;
      }, 0) / numberOfRunsToExecute;

    return { name, averageInMS, timeImproved: new Date().toISOString() };
  });
};

const processResults = async (results: TestResult[]) => {
  const isNoticeableDifference = (previous: number, current: number) => {
    return Math.abs(current - previous) / previous > noticeableThreshold;
  };

  const previousResults: TestResult[] = JSON.parse(
    await fs.readFile("./benchmark/results.json", "utf-8")
  );

  const newPerformanceResults: PerformanceDiff[] = [];
  const improvedPerformance: PerformanceDiff[] = [];
  const decreasedPerformance: PerformanceDiff[] = [];

  results.forEach((result) => {
    const wasPreviousResult = previousResults.find(
      (previousResult) => previousResult.name === result.name
    );

    if (!wasPreviousResult) {
      //New performance test or was not previously recorded
      newPerformanceResults.push(result);
    } else {
      const timeDifference = result.averageInMS - wasPreviousResult.averageInMS;
      const isFaster = result.averageInMS < wasPreviousResult.averageInMS;
      const timeDifferencePercentage = (
        (Math.abs(timeDifference) / wasPreviousResult.averageInMS) *
        100
      ).toFixed(2);

      if (
        isFaster &&
        isNoticeableDifference(
          wasPreviousResult.averageInMS,
          result.averageInMS
        )
      ) {
        //Improved performance
        improvedPerformance.push({
          ...result,
          percentageChange: `${timeDifferencePercentage}%`,
        });
      } else if (
        !isFaster &&
        isNoticeableDifference(
          wasPreviousResult.averageInMS,
          result.averageInMS
        )
      ) {
        //Decreased performance
        decreasedPerformance.push({
          ...result,
          percentageChange: `${timeDifferencePercentage}%`,
        });
      }
    }
  });

  console.log("newPerformanceResults: ", newPerformanceResults);
  console.log("improvedPerformance: ", improvedPerformance);
  console.log("decreasedPerformance: ", decreasedPerformance);
};

const main = async () => {
  const performanceTests = await importFiles();
  const results = runPerformanceTests(performanceTests);
  const tabledResults = collatedTestResults(results);
  await processResults(tabledResults);
};

main();
