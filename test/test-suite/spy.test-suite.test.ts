import { Spy } from '../../src/spy';

const beforeEachSpy = Spy('beforeEach');
Spy.setup({ beforeEach: beforeEachSpy, afterEach: () => {} });

const Guy = {
    swim: () => 'fish',
    goTo: (where: string) => 'go to --> ' + where,
};

describe('Spy - Test-Suite with throwing scoped mock', () => {
    const Guy$Mock = Spy.mock(Guy, 'swim');
    const anotherGuy$Mock = Spy.mock(Guy, 'swim');

    afterEach(() => {
        Spy.restoreAll();
    });

    it('throws an error if scoped mocks can not initialize', () => {
        expect(Guy$Mock.swim).toBeDefined();
        expect(anotherGuy$Mock.swim).toBeDefined();

        beforeEachSpy.getCallArgument(0)(); // does not fail
        expect(() => beforeEachSpy.getCallArgument(1)()).toThrowErrorMatchingInlineSnapshot(`
"Could not initialize mock because:
The objects attribute 'swim' was already spied. Please make sure to spy only once at a time at any attribute."
`);
    });
});

// TODO: Investigate if the whole module could be replaced by a Proxy to overcome this issue. Also check for ESM compat
describe('Spy - Test-Suite with throwing scoped mock because of getters only', () => {
    const Mock$BabelCore = Spy.mockModule('@babel/core', 'buildExternalHelpers');

    it('throws an error if scoped mocks can not initialize', () => {
        expect(Mock$BabelCore.buildExternalHelpers).toBeDefined();

        expect(() => beforeEachSpy.getCallArgument(2)()).toThrowErrorMatchingInlineSnapshot(`
"Could not initialize mock because:
Cannot set property buildExternalHelpers of [object Object] which has only a getter
Inserting a module mock might resolve this problem. Add this code first:

jest.mock('@babel/core');

Or if you don't want to mock everything from this module, you can use this:

jest.mock('@babel/core', () => ({
    ...jest.requireActual('@babel/core'),
    'buildExternalHelpers': () => undefined,
}));"
`);
    });
});
