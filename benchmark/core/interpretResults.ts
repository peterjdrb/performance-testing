import { promises as fs } from "fs";

import { TestResult, InterpretedResults, PerformanceDiff } from "../types";
import { commandArgs } from "../config";

export const interpretResults = async (
    results: TestResult[]
): Promise<InterpretedResults> => {
    const isNoticeableDifference = (previous: number, current: number) => {
        return Math.abs(current - previous) / previous > commandArgs.threshold;
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
            const percentageChange = `${(
                (Math.abs(timeDifference) / wasPreviousResult.averageInMS) *
                100
            ).toFixed(3)}%`;

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
                    percentageChange,
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
                    percentageChange,
                });
            } else {
                //No noticeable diff performance
                noNoticablePerformance.push({
                    ...result,
                    percentageChange,
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