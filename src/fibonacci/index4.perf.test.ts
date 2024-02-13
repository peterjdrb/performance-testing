import { fibonacci } from "./fibonacci";

export const test = () => {
  for (let n = 1; n < 40; n++) {
    fibonacci(n);
  }
};
