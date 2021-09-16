import { Spy } from '../../src/spy';
import { TestSuite } from '../../src/test-suite';

TestSuite.configure({
    beforeEach: () => {},
    afterEach: () => {},
});

const Guy = {
    swim: () => 'fish',
    goTo: (where: string) => 'go to --> ' + where,
};

describe('Spy - Test-Suite with throwing scoped mock', () => {
    const Guy$Mock = Spy.mock(Guy, 'swim');
    const anotherGuy$Mock = Spy.mock(Guy, 'swim');
    it('throws an error if scoped mocks can not initialize', () => {
        expect(Guy$Mock.swim).toBeDefined();
        expect(anotherGuy$Mock.swim).toBeDefined();

        expect(() => Spy.initMocks('Spy - Test-Suite with throwing scoped mock')).toThrowErrorMatchingInlineSnapshot(`
"Could not initialize mock for scope \\"Spy - Test-Suite with throwing scoped mock\\", because:
The objects attribute 'swim' was already spied. Please make sure to spy only once at a time at any attribute."
`);
    });
});

describe('Spy - Test-Suite with throwing scoped mock because of getters only', () => {
    const Mock$BabelCore = Spy.mockModule('@babel/core', 'buildExternalHelpers');

    it('throws an error if scoped mocks can not initialize', () => {
        expect(Mock$BabelCore.buildExternalHelpers).toBeDefined();

        expect(() => Spy.initMocks('Spy - Test-Suite with throwing scoped mock because of getters only'))
            .toThrowErrorMatchingInlineSnapshot(`
"Could not initialize mock for scope \\"Spy - Test-Suite with throwing scoped mock because of getters only\\", because:
Cannot set property buildExternalHelpers of [object Object] which has only a getter
Inserting a jest module mock might resolve this problem. Put this outside of the \\"describe\\":

jest.mock('@babel/core');

Or if you don't want to mock everything from this module, you can use this:

jest.mock('@babel/core', () => ({
    ...jest.requireActual('@babel/core'),
    'buildExternalHelpers': () => {},
}));"
`);
    });
});
