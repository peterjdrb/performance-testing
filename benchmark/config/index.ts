export const numberOfRunsToExecute = 3;

export const commandArgs = () => {
    const args = process.argv.slice(2);

    return {
        dryRun: args.findIndex((arg) => arg.toLowerCase() === '--dry-run') !== -1,
        threashhold: () => {
            const cliParam = '-noticeableThreshold=';
            const passedIn = args.find((arg) => arg.toLowerCase().startsWith(cliParam.toLowerCase()));
            let noticeableThreshold = 0.1;

            if (passedIn) {
                noticeableThreshold = +passedIn.split("=")[1];
                if (isNaN(noticeableThreshold)) {
                    console.error("The noticeableThreshold arg must be a decimal between 0 and 1 inclusive")
                }
            }

            return noticeableThreshold
        },
    }
}