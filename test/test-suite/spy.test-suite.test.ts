/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */
import { Spy } from '../../src/spy';

const Matrix = { tearDown: () => 1337, startup: () => 1 };
const Matrix$Mock = Spy.mock(Matrix, 'startup');

describe('Spy - Test-Suite', () => {
    let data = {} as { foo?: string };
    let persistentSpy = Spy('persistentSpy');

    // the latest moment you might reconfigure the behavior of
    // the applied test suite hooks is within a describe hook.
    // But you shouldn't because it affects also other describe-blocks
    Spy.configure({
        beforeEach: () => {
            // does NOT call Spy.initMocks
            data = {}; // reinitialize data
            persistentSpy = Spy.on(Matrix, 'tearDown').returns(42).configure({
                persistent: true,
            }); // persistent spies have to be restored individually and are not affected by Spy.restoreAll
        },
        afterEach: () => {
            // does NOT call Spy.restoreAll
            persistentSpy.configure({ persistent: false }).restore(); // restore this one (--> else spying again would fail)
        },
    });
    it('modifies the data part 1', () => {
        expect(data).toEqual({});
        data.foo = 'bar';
    });

    it('modifies the data part 2', () => {
        expect(data).toEqual({});
    });

    it('initializes mock not manually', () => {
        expect(Matrix$Mock.startup).toThrowErrorMatchingInlineSnapshot(
            `"Method 'startup' was not initialized on Mock."`
        );
        expect((Matrix$Mock as any).tearDown).toBe(undefined);

        expect(Matrix.startup()).toBe(1);
        expect(Matrix.tearDown()).toBe(42);

        persistentSpy.wasCalled();

        Spy.initMocks();
        Matrix$Mock.startup.returns('go go go');
        expect(Matrix.startup()).toBe('go go go');

        expect(Spy.initMocks).toThrowErrorMatchingInlineSnapshot(`
"Could not initialize mock for global scope, because:
The objects attribute 'startup' was already spied. Please make sure to spy only once at a time at any attribute."
`); // double init not allowed
    });
});
