export interface TestResult {
    name: string;
    averageInMS: number;
    timeRecorded: string;
}

export interface PerformanceDiff extends TestResult {
    percentageChange?: string;
}

export interface InterpretedResults {
    removedPerformanceResults: PerformanceDiff[];
    newPerformanceResults: PerformanceDiff[];
    improvedPerformance: PerformanceDiff[];
    decreasedPerformance: PerformanceDiff[];
    noNoticablePerformance: PerformanceDiff[];
    previousResults: PerformanceDiff[];
}