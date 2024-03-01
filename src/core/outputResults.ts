import { InterpretedResults } from "../types";

export const outputResults = (results: Omit<InterpretedResults, 'noNoticablePerformance' | 'previousResults'>) => {
    const {
      decreasedPerformance,
      improvedPerformance,
      newPerformanceResults,
      removedPerformanceResults,
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
  };