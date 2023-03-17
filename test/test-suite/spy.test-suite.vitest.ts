import { Spy } from '../../src/spy';

const beforeEachSpy = Spy('beforeEach');
Spy.setup({ beforeEach: beforeEachSpy, afterEach: () => {} });

describe('Spy - Test-Suite with throwing scoped mock because of getters only (vitest)', async () => {
    const Mock$BabelCore = Spy.mock(await import('@babel/core' as any), 'buildExternalHelpers');

    it('throws an error if scoped mocks can not initialize', () => {
        expect(Mock$BabelCore.buildExternalHelpers).toBeDefined();

        expect(() => beforeEachSpy.getCallArgument(0)()).toThrowError(
            `
Could not initialize mock because:
Cannot set property buildExternalHelpers of #<Object> which has only a getter
Inserting a module mock might should resolve this problem. Run this code beforehand:

vi.mock('<module-name>');

Or if you don't want to mock everything from this module, you can use this:

vi.mock('<module-name>', async () => ({ ...((await vi.importActual('<module-name>')) as any) }));
`.trim()
        );
    });
});
