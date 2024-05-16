import { describe, expect, it } from 'vitest';
import { Config } from '../../src/config';
import { Spy } from '../../src/spy';

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
