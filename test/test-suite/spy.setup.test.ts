import { Spy } from '../../src/spy';
import { Config } from '../../src/config';

describe('Spy.setup', () => {
    it('vitest runner - missing expect', () => {
        Config.expect = undefined;
        Config.runner = 'vitest';
        expect(Spy.setup).toThrowError(`Please provide "beforeEach", "afterEach" and "expect" functions. E.g. like this:

import { beforeEach, afterEach, expect } from 'vitest';

Spy.setup({ beforeEach, afterEach, expect });`);
    });

    it('non-vitest runner - missing expect', () => {
        Config.expect = undefined;
        Config.runner = 'jest';
        expect(Spy.setup).toThrowError(`Please provide "beforeEach", "afterEach" and "expect" functions.`);
    });
});
