import { asyncTest } from "./index";

export const performanceTest = async () => {
  for (let n = 1; n <= 500; n++) {
    await asyncTest(n);
  }
};
