import { execSync } from 'node:child_process';

let gitHash = process.env.HEROKU_SLUG_COMMIT?.slice(0, 8) || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8);
let gitDate: Date | undefined;

if (process.env.GIT_DATE) {
    const date = new Date(process.env.GIT_DATE);
    if (!Number.isNaN(date.getTime())) {
        gitDate = date;
    }
}

if (!gitHash) {
    try {
        gitHash = execSync('git rev-parse HEAD').toString().trim().slice(0, 8);
        if (!gitDate) {
            gitDate = new Date(execSync('git log -1 --format=%cd').toString().trim());
        }
    } catch {
        gitHash = 'unknown';
    }
}

export { gitDate, gitHash };
