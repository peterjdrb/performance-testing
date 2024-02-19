export const fibonacciRecursion = (n: number): number => {
    if (n <= 1) {
      return n;
    }
    return fibonacciRecursion(n - 1) + fibonacciRecursion(n - 2);
  };
  
  export const asyncTest = async (ms: number) => {
    await new Promise((resolve) => setTimeout(resolve, ms % 4));
  };
  
  export const fibonacci = (n: number): number => {
    const numbers: number[] = [];
  
    for (let i = 1; i <= n; i++) {
      if (i === 1 || i === 2) {
        numbers.push(1);
        continue;
      }
  
      let lastNumber: number = numbers[numbers.length - 1];
      let theNumberBeforeTheLast: number = numbers[numbers.length - 2];
      numbers.push(lastNumber + theNumberBeforeTheLast);
    }
  
    return numbers.slice(-1)[0];
  };
  
