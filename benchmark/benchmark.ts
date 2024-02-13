import fs from "fs";
import { performance, PerformanceObserver } from "perf_hooks";

const averageOverRuns = 3;

const importFiles = async () => {
  const files = fs
    .readdirSync("./src/", { recursive: true })
    .filter((file) => (file as string).endsWith(".perf.test.ts"));

  const tests: Array<[string | Buffer, any]> = [];
  for (const file of files) {
    const importedTests = await import(`../src/${file}`);
    tests.push([file, importedTests.test]);
  }

  return tests;
};

const main = async () => {
  const test = await importFiles();
  // Create a PerformanceObserver to collect performance entries
  const observer = new PerformanceObserver(() => {});
  observer.observe({ entryTypes: ["measure"], buffered: true });

  test.forEach(([file, test]) => {
    console.log("Running file: ", file);
    for (let i = 0; i < averageOverRuns; i++) {
      // Measure the performance of the fibonacci function
      performance.mark("start");
      test();
      performance.mark("end");
      performance.measure(file as string, "start", "end");
    }
  });

  let results = performance.getEntriesByType("measure");
  const tabledResults = results.map((result) => [result.name, result.duration]);
  console.table(tabledResults);
};

main();
