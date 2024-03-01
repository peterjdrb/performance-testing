import { promises as fs } from "fs";

export const importFiles = async () => {
    let files = await fs.readdir("./src/", { recursive: true });
    files = files.filter((file) => (file as string).endsWith(".perf.test.ts"));

    const tests: Array<[string | Buffer, any]> = [];
    for (const file of files) {
        const importedTests = await import(`../../src/${file}`);
        tests.push([`src/${file}`, importedTests.performanceTest]);
    }

    return tests;
};
