// ------------------------------- NODE MODULES -------------------------------

import { promises as fs } from "fs";
import { performance, PerformanceObserver, PerformanceEntry } from "perf_hooks";

// ------------------------------ CUSTOM MODULES ------------------------------

// -------------------------------- VARIABLES ---------------------------------

interface TestResult {
  name: string;
  averageInMS: number;
  timeRecorded: string;
}

interface PerformanceDiff extends TestResult {
  percentageChange?: string;
}

interface InterpretedResults {
  removedPerformanceResults: PerformanceDiff[];
  newPerformanceResults: PerformanceDiff[];
  improvedPerformance: PerformanceDiff[];
  decreasedPerformance: PerformanceDiff[];
  noNoticablePerformance: PerformanceDiff[];
  previousResults: PerformanceDiff[];
}

const numberOfRunsToExecute = 10;
const noticeableThreshold = 0.1;

// ----------------------------- FILE DEFINITION ------------------------------

const importFiles = async () => {
  let files = await fs.readdir("./src/", { recursive: true });
  files = files.filter((file) => (file as string).endsWith(".perf.test.ts"));

  const tests: Array<[string | Buffer, any]> = [];
  for (const file of files) {
    const importedTests = await import(`../src/${file}`);
    tests.push([`src/${file}`, importedTests.performanceTest]);
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

    return { name, averageInMS, timeRecorded: new Date().toISOString() };
  });
};

const interpretResults = async (
  results: TestResult[]
): Promise<InterpretedResults> => {
  const isNoticeableDifference = (previous: number, current: number) => {
    return Math.abs(current - previous) / previous > noticeableThreshold;
  };

  //Read previous results
  let previousResults: TestResult[] = JSON.parse(
    await fs.readFile("./benchmark/results.json", "utf-8")
  );

  //Get the results that have been removed
  const removedPerformanceResults = previousResults.filter(
    (previousResult) =>
      results.findIndex((result) => result.name === previousResult.name) === -1
  );

  //Remove any previous results that are not in the current results
  previousResults = previousResults.filter((previousResult) => {
    return (
      results.findIndex((result) => result.name === previousResult.name) !== -1
    );
  });

  const newPerformanceResults: PerformanceDiff[] = [];
  const improvedPerformance: PerformanceDiff[] = [];
  const decreasedPerformance: PerformanceDiff[] = [];
  const noNoticablePerformance: PerformanceDiff[] = [];

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
      } else {
        //No noticeable diff performance
        noNoticablePerformance.push({
          ...result,
          percentageChange: `${timeDifferencePercentage}%`,
        });
      }
    }
  });

  return {
    removedPerformanceResults,
    newPerformanceResults,
    improvedPerformance,
    decreasedPerformance,
    noNoticablePerformance,
    previousResults,
  };
};

const processResults = (results: InterpretedResults) => {
  const {
    decreasedPerformance,
    improvedPerformance,
    newPerformanceResults,
    removedPerformanceResults,
    previousResults,
  } = results;

  const diffInPerformance =
    removedPerformanceResults.length > 0 ||
    newPerformanceResults.length > 0 ||
    improvedPerformance.length > 0 ||
    decreasedPerformance.length > 0;

  if (!diffInPerformance) {
    console.log("No noticable changes in performance detected");
    process.exit();
  }

  console.log("************ Results ************");

  if (removedPerformanceResults.length > 0) {
    console.log("Removed performance results:");
    console.table(removedPerformanceResults);
  }

  if (newPerformanceResults.length > 0) {
    console.log("New performance results:");
    console.table(newPerformanceResults);
  }

  if (improvedPerformance.length > 0) {
    console.log("Improved performance:");
    console.table(improvedPerformance);
  }

  if (decreasedPerformance.length > 0) {
    console.log("Decreased performance:");
    console.table(decreasedPerformance);
    process.exit(1);
  }

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

const main = async () => {
  const performanceTests = await importFiles();
  const results = runPerformanceTests(performanceTests);
  const tabledResults = collatedTestResults(results);
  const interpretedResults = await interpretResults(tabledResults);
  processResults(interpretedResults);
};

main();
