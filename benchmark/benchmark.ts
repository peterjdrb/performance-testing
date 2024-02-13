import fs from "fs";
import { performance, PerformanceObserver } from "perf_hooks";

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

const main = async () => {
  const test = await importFiles();
  // Create a PerformanceObserver to collect performance entries
  const observer = new PerformanceObserver(() => {});
  observer.observe({ entryTypes: ["measure"], buffered: true });

  test.forEach(([file, performanceTest]) => {
    for (let i = 0; i < numberOfRunsToExecute; i++) {
      if (!performanceTest) {
        console.error(`Error in ${file}: performanceTest is not defined. Have you exported it?`);
        break;
      }
      // Measure the performance of the fibonacci function
      performance.mark("start");
      performanceTest();
      performance.mark("end");
      performance.measure(file as string, "start", "end");
    }
  });

  let results = performance.getEntriesByType("measure");

  const uniqueFileNames = [...new Set(results.map((element) => element.name))];

  const tabledResults = uniqueFileNames.flatMap((name) => {
    const allRuns = results.filter((result) => result.name === name);

    const average =
      allRuns.reduce((acc, result) => {
        return acc + result.duration;
      }, 0) / numberOfRunsToExecute;

    return { name, average };
  });

  console.log(tabledResults);
};

main();
