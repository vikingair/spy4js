import { expect } from 'vitest';

expect.addSnapshotSerializer = () => null;
expect.getState = () => ({} as any);
expect.getState = () => ({} as any);
expect.extend({
    toMatchInlineSnapshot: function (actual, match) {
        const padding = match.includes('\n') ? ' '.repeat(match.substring(1).indexOf('"')) : '';
        const pass = match.trim().slice(1, -1).replaceAll(padding, '') === actual;
        if (pass) {
            return {
                message: () =>
                    `expected ${this.utils.printReceived(actual)} not to match ${this.utils.printExpected(match)}`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `expected ${this.utils.printReceived(actual)} to match ${this.utils.printExpected(match)}`,
                pass: false,
            };
        }
    },
});
