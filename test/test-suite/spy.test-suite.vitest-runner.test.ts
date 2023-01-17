delete process.env.JEST_WORKER_ID;

import { Spy } from '../../src/spy';

const beforeEachSpy = Spy('beforeEach');
Spy.setup({ beforeEach: beforeEachSpy, afterEach: () => {} });

describe('Spy - Test-Suite with throwing scoped mock because of getters only (vitest)', () => {
    const Mock$BabelCore = Spy.mockModule('@babel/core', 'buildExternalHelpers');

    it('throws an error if scoped mocks can not initialize', () => {
        expect(Mock$BabelCore.buildExternalHelpers).toBeDefined();

        expect(() => beforeEachSpy.getCallArgument(0)()).toThrowErrorMatchingInlineSnapshot(`
"Could not initialize mock because:
Cannot set property buildExternalHelpers of [object Object] which has only a getter
Inserting a module mock might resolve this problem. Add this code first:

vi.mock('@babel/core');

Or if you don't want to mock everything from this module, you can use this:

vi.mock('@babel/core', () => ({
    ...vi.requireActual('@babel/core'),
    'buildExternalHelpers': () => undefined,
}));"
`);
    });
});
