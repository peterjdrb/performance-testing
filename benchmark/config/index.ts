export const numberOfRunsToExecute = 3;
export const noticeableThreshold = 0.1;

export const commandArgs = () => {
    const args = process.argv.slice(2);

    return {
        dryRun: args.findIndex((arg) => arg.toLowerCase() === '--dry-run') !== -1,
    }
}