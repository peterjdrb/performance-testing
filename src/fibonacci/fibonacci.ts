export const fibonacci = (n: number): number => {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// export const fibonacci = (n: number): number => {
//   const numbers: number[] = [];

//   for (let i = 1; i <= n; i++) {
//     if (i === 1 || i === 2) {
//       numbers.push(1);
//       continue;}

//     let lastNumber: number = numbers[numbers.length - 1];
//     let theNumberBeforeTheLast: number = numbers[numbers.length - 2];
//     numbers.push(lastNumber + theNumberBeforeTheLast);
//   }

//   return numbers.pop() as number;
// };
