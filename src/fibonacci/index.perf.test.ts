import { fibonacci, fibonacciRecursion } from "./fibonacci";

export const performanceTest = () => {
  for (let n = 1; n <= 40; n++) {
    fibonacciRecursion(n);
  }
};
