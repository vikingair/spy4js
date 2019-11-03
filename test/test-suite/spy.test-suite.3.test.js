// @flow

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

        expect(() =>
            Spy.initMocks('Spy - Test-Suite with throwing scoped mock')
        ).toThrowErrorMatchingInlineSnapshot(`
"Could not initialize mock for scope \\"Spy - Test-Suite with throwing scoped mock\\", because:
The objects attribute 'swim' was already spied. Please make sure to spy only once at a time at any attribute."
`);
    });
});
