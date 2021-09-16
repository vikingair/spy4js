export const Env = { isJest: process.env.JEST_WORKER_ID !== undefined, isCJS: typeof module !== 'undefined' };
