import { promises as fs } from "fs";

const fileExtenstions = ["ts", "js"]

export const importFiles = async () => {
    let files = await fs.readdir("./src/", { recursive: true });
    const testFiles: string[] = []

    fileExtenstions.forEach((ext) => {
        testFiles.push(...files.filter((file) => (file as string).endsWith(`.perf.test.${ext}`)))
    })

    const tests: Array<[string | Buffer, any]> = [];

    for (const file of testFiles) {
        const importedTests = await import(`../../src/${file}`);
        tests.push([`src/${file}`, importedTests.performanceTest]);
    }

    return tests;
};
