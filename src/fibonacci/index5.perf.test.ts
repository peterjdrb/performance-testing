import { fibonacci } from "./index";

export const performanceTest = () => {
  for (let n = 1; n <= 80; n++) {
    fibonacci(n);
  }
};
