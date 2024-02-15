import { fibonacciRecursion } from "./index";

export const performanceTest = () => {
  for (let n = 1; n <= 40; n++) {
    fibonacciRecursion(n);
  }
};
