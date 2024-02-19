import { PerformanceObserver } from "perf_hooks";

import { numberOfRunsToExecute } from "../config";

const runSyncOrAsync = async (test: Function) => {
    performance.mark("start");

    let result = test();
    if (result instanceof Promise) {
        result = await result;
    }

    performance.mark("end");
    return result;
};

export const runPerformanceTests = async (
    performanceTests: [string | Buffer, any][]
) => {
    // Create a PerformanceObserver to collect performance entries
    const observer = new PerformanceObserver(() => { });
    observer.observe({ entryTypes: ["measure"], buffered: true });

    for (const fileIndex in performanceTests) {
        const [file, performanceTest] = performanceTests[fileIndex];
        console.log(
            `Running performance test ${Number(fileIndex) + 1} of ${performanceTests.length
            }`
        );
        console.log(file);

        if (!performanceTest) {
            console.error(
                `Error in ${file}: performanceTest is not defined. Have you exported it?`
            );
            continue;
        }

        for (let i = 0; i < numberOfRunsToExecute; i++) {
            console.log(`current run ${i + 1} of ${numberOfRunsToExecute}`);
            // Measure the performance of the fibonacci function
            await runSyncOrAsync(performanceTest);
            performance.measure(file as string, "start", "end");
        }
    }

    return performance.getEntriesByType("measure");
};
