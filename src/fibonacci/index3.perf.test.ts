import { fibonacci } from "./fibonacci";

export const performanceTest = () => {
  for (let n = 1; n <= 30; n++) {
    fibonacci(n);
  }
};
