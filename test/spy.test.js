/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { equals, equalsNot, throws } from '../util/facts';
import { Spy } from '../src/spy';

describe('Spy - Utils', () => {
    afterEach(Spy.restoreAll);

    const errorThrower: any = () => {
        throw new Error('never call this func directly');
    };

    const noop: any = () => {};

    it('should not allow to use the constructor of the Spy without new', () => {
        throws(Spy, { partOfMessage: 'only with "new" keyword' });
    });

    it('should call the Spy and record the call arguments', () => {
        const spy = new Spy();
        const someDate = new Date();
        spy(9, 'test', someDate);
        equals(spy.getCallArguments(), [9, 'test', someDate]);
        // and more general
        spy.wasCalledWith(9, 'test', someDate);
    });

    it('throws an exception that the spy was never called if not called when wasCalledWith or wasCalled gets called', () => {
        const spy = new Spy();
        throws(() => spy.wasCalled(), {
            partOfMessage: 'was never called!',
        });
        throws(() => spy.wasCalledWith(), {
            partOfMessage: 'was never called!',
        });
    });

    it('should place the Spy on an object and record the call arguments', () => {
        const testObject = { someFunc: errorThrower };
        const spy = Spy.on(testObject, 'someFunc');
        const someDate = new Date();
        testObject.someFunc('test', 6, someDate);
        equals(spy.getCallArguments(), ['test', 6, someDate]);
        // and more general
        spy.wasCalledWith('test', 6, someDate);
    });

    it('should throw if trying to spy other attributes than functions', () => {
        const testObject = {
            attrString: 'string',
            attrNumber: 12,
            attrNull: null,
            attrDate: new Date(),
            attrObject: {},
        };
        throws(() => Spy.on(testObject, 'attrString'), {
            partOfMessage: 'only spy on functions!',
        });
        throws(() => Spy.on(testObject, 'attrNumber'), {
            partOfMessage: 'only spy on functions!',
        });
        throws(() => Spy.on(testObject, 'attrNull'), {
            partOfMessage: 'only spy on functions!',
        });
        throws(() => Spy.on(testObject, 'attrDate'), {
            partOfMessage: 'only spy on functions!',
        });
        throws(() => Spy.on(testObject, 'attrObject'), {
            partOfMessage: 'only spy on functions!',
        });
        throws(() => Spy.on(testObject, 'attrUnknown'), {
            partOfMessage: 'only spy on functions!',
        });
    });

    it('should throw if trying to spy on already spied attributes.', () => {
        const testObject = { attr: () => {} };
        const firstSpy = Spy.on(testObject, 'attr');
        // spying again does throw now
        throws(() => Spy.on(testObject, 'attr'), {
            partOfMessage: 'was already spied',
        });
        // after restoring the spy, we can spy there again
        firstSpy.restore();
        Spy.on(testObject, 'attr');
    });

    it('should place many Spies on an object and record different call arguments', cb => {
        const testObject = {
            func1: errorThrower,
            func2: errorThrower,
            func3: () => cb(),
            func4: errorThrower,
        };

        const [spy1, spy2, spy3] = Spy.onMany(
            testObject,
            'func1',
            'func2',
            'func4'
        );
        testObject.func1('test', 6);
        equals(spy1.getCallArguments(), ['test', 6]);
        spy1.wasCalledWith('test', 6);
        testObject.func2('', 7);
        equals(spy2.getCallArguments(), ['', 7]);
        spy2.wasCalledWith('', 7);
        testObject.func4();
        equals(spy3.getCallArguments(), []);
        spy3.wasCalledWith();
        // if this would get spied, the test callback
        // would never be called which would make the test fail
        testObject.func3();
    });

    it('throws an exception if getCallArguments gets called with float', () => {
        const spy = new Spy();
        spy(123);
        throws(() => spy.getCallArguments(0.5), {
            partOfMessage: 'callNr "0.5" was not valid',
        });
    });

    it('should restore all Spies', cb => {
        const testObject = {
            func1: noop,
            func2: errorThrower,
            func3: (arg: string) => {
                equals(arg, 'testCall8');
                cb();
            },
            func4: errorThrower,
        };
        const [spy1, spy2] = Spy.onMany(
            testObject,
            'func1',
            'func2',
            'func3',
            'func4'
        );
        testObject.func1('testCall1');
        testObject.func2('testCall2');
        testObject.func3('testCall3');
        testObject.func4('testCall4');

        // this removes all spies from the testObject,
        // but does not destroy their functionality
        Spy.restoreAll();

        testObject.func1('testCall5');
        throws(() => testObject.func2('testCall6'));
        spy1.wasCalledWith('testCall1');
        throws(() => spy1.wasCalledWith('testCall5'));
        throws(() => spy2.wasCalledWith('testCall6'));
        if (spy1 instanceof Function) {
            spy1('testCall7');
        } else {
            throw new Error('spy should always be callable');
        }
        spy1.wasCalledWith('testCall7');
        // if this would get spied, the test callback would
        // never be called which would make the test fail
        testObject.func3('testCall8');
    });

    it('should restore single Spies', cb => {
        const testObject = {
            func1: noop,
            func2: errorThrower,
            func3: (arg: string) => {
                equals(arg, 'testCall8');
                cb();
            },
            func4: errorThrower,
        };
        const [spy1, , spy3] = Spy.onMany(
            testObject,
            'func1',
            'func2',
            'func3',
            'func4'
        );
        testObject.func1('testCall1');
        testObject.func2('testCall2');
        testObject.func3('testCall3');
        testObject.func4('testCall4');

        // this removes first spy from the testObject
        spy1.restore();

        testObject.func1('testCall5');
        testObject.func3('testCall6');

        spy1.wasCalledWith('testCall1');
        throws(() => spy1.wasCalledWith('testCall5'));

        spy3.wasCalledWith('testCall3');
        spy3.wasCalledWith('testCall6');
        spy3.restore();
        // if this would get spied, the test callback
        // would never be called which would make the test fail
        testObject.func3('testCall8');
    });

    it('should recognize when the Spy was not called', () => {
        const spy = new Spy();
        spy.wasNotCalled();
        spy({ _key: 'test' });
        spy.wasCalledWith({ _key: 'test' });
        throws(() => spy.wasNotCalled(), {
            partOfMessage: 'was not considered to be called',
        });
    });

    it('should inspect calls for given arguments of the Spy correctly', () => {
        const spy = new Spy();
        const testArg1 = { _key: 'test1' };
        const testArg2 = { _key: 'test2' };
        const testArg3 = { _key: 'test3' };
        spy(testArg1);
        spy(testArg1, testArg2);
        spy(testArg3, testArg2, testArg1);
        spy(testArg2);
        spy.wasCalled();
        throws(() => spy.wasCalled(2));
        spy.wasCalled(4);
        spy.wasCalledWith(testArg1);
        throws(() => spy.wasNotCalledWith(testArg1));
        spy.wasCalledWith(testArg2);
        throws(() => spy.wasNotCalledWith(testArg2));
        spy.wasCalledWith(testArg1, testArg2);
        throws(() => spy.wasNotCalledWith(testArg1, testArg2));
        spy.wasCalledWith(testArg3, testArg2, testArg1);
        throws(() => spy.wasNotCalledWith(testArg3, testArg2, testArg1));
        throws(() => spy.wasCalledWith(testArg3));
        spy.wasNotCalledWith(testArg3);
        throws(() => spy.wasCalledWith(testArg3, testArg2));
        spy.wasNotCalledWith(testArg3, testArg2);
        throws(() => spy.wasCalledWith(testArg3, testArg1, testArg2));
        spy.wasNotCalledWith(testArg3, testArg1, testArg2);
    });

    it('should return call arguments of the Spy correctly', () => {
        const spy = new Spy();
        const testArg1 = { _key: 'test1' };
        const testArg2 = { _key: 'test2' };
        const testArg3 = { _key: 'test3' };
        spy(testArg1);
        spy(testArg1, testArg2);
        spy(testArg3, testArg2, testArg1);
        spy(testArg2);

        equals(spy.getCallArguments(), [testArg1]);
        equals(spy.getCallArguments(0), [testArg1]);
        equals(spy.getCallArgument(), testArg1);
        equals(spy.getCallArgument(0), testArg1);
        equals(spy.getCallArgument(undefined, 1), undefined);

        equals(spy.getCallArguments(1), [testArg1, testArg2]);
        equals(spy.getCallArgument(1), testArg1);
        equals(spy.getCallArgument(1, 1), testArg2);
        equals(spy.getCallArgument(1, 2), undefined);

        equals(spy.getCallArguments(2), [testArg3, testArg2, testArg1]);
        equals(spy.getCallArgument(2), testArg3);
        equals(spy.getCallArgument(2, 1), testArg2);
        equals(spy.getCallArgument(2, 2), testArg1);
        equals(spy.getCallArgument(2, 3), undefined);

        equals(spy.getCallArguments(3), [testArg2]);
        equals(spy.getCallArgument(3), testArg2);
    });

    it('does return the call count of the Spy correctly', () => {
        const spy = new Spy();
        equals(spy.getCallCount(), 0);
        spy();
        equals(spy.getCallCount(), 1);
        spy();
        equals(spy.getCallCount(), 2);
        spy();
        equals(spy.getCallCount(), 3);
        spy.reset();
        equals(spy.getCallCount(), 0);
        spy();
        equals(spy.getCallCount(), 1);
    });

    it('should return call arguments in an appropriate display string', () => {
        const spy = new Spy();
        spy.wasNotCalled();
        spy({ _key: 'myTestArguments' });
        spy({ _key: 'someOtherArguments' }, 42);
        const displayString = spy.showCallArguments();
        equalsNot(displayString.indexOf('myTestArguments'), -1);
        equalsNot(displayString.indexOf('someOtherArguments'), -1);
        equalsNot(displayString.indexOf('42'), -1);
    });

    it('shows that the spy was not called if this is the fact', () => {
        const spy = new Spy();
        equals(spy.showCallArguments(), 'the spy was never called!\n');
    });

    it('should return undefined if no return value is supplied', () => {
        const spy = new Spy().returns();
        equals(spy('callParams1'), undefined);
        spy.returns(42);
        equals(spy('callParams2'), 42);
        spy.returns();
        equals(spy('callParams3'), undefined);
    });

    it('should return given inputs after the spy was called', () => {
        const testObj = { _key: 'testObj' };
        const spy = new Spy().returns(testObj);
        equals(spy({ _key: 'callParams1' }), testObj);
        equals(spy({ _key: 'callParams2' }), testObj);
    });

    it(
        'should return given inputs sequentially' + ' after the spy was called',
        () => {
            const testObj1 = { _key: 'testObj1' };
            const testObj2 = { _key: 'testObj2' };
            const testObj3 = { _key: 'testObj3' };
            const spy = new Spy().returns(testObj1, testObj2, testObj3);
            equals(spy({ _key: 'callParams1' }), testObj1);
            equals(spy({ _key: 'callParams2' }), testObj2);
            equals(spy({ _key: 'callParams3' }), testObj3);
            equals(spy({ _key: 'callParams4' }), testObj3);
        }
    );

    it('should reset the call arguments', () => {
        const spy = new Spy();
        spy('callParams1');
        spy('callParams2');
        spy('callParams3');
        spy.wasCalled(3);
        spy.reset();
        spy.wasNotCalled();
        spy('callParams3');
        spy.wasCalled(1);
    });

    it('should throw if requested and called', () => {
        const spy = new Spy().throws('errorMessage');
        throws(() => spy({ _key: 'callParams1' }), { message: 'errorMessage' });
        spy.throws(null);
        throws(() =>
            spy(
                { _key: 'callParams2' },
                { partOfMessage: 'was requested to throw' }
            )
        );
    });

    it('should reset the call arguments on an object spy and NOT removing it (LIKE RESTORE)', cb => {
        const testObject = {
            func: (allowed: string) => {
                equals(allowed, 'testCall3');
                cb();
            },
        };
        const spy = Spy.on(testObject, 'func');
        testObject.func('testCall1');

        spy.wasCalledWith('testCall1');
        spy.reset();
        spy.wasNotCalled();

        testObject.func('testCall2');

        spy.wasCalledWith('testCall2');
        throws(() => spy.wasCalledWith('testCall1'));

        spy.restore();
        // if this would get spied, the test callback
        // would never be called which would make the test fail
        testObject.func('testCall3');
    });

    it('should call NOP if no input-function is supplied', () => {
        const spy = new Spy().calls();
        equals(spy('callParams1'), undefined);
        spy.calls(() => 42);
        equals(spy('callParams2'), 42);
        spy.calls();
        equals(spy('callParams3'), undefined);
    });

    it('should call the given input-function after the spy was called', () => {
        const testObj = { _key: 'testObj' };
        const spy = new Spy().calls(arg => {
            testObj._key = arg;
            return null;
        });
        equals(spy('callParams1'), null);
        equals(testObj._key, 'callParams1');
    });

    it('ignores specified arguments when using Spy.IGNORE together with wasCalledWith', () => {
        const testObj = {
            _key: 'some hard to construct and/or uninteresting value',
            prop: 'whatever',
        };
        const spy = new Spy();
        spy(testObj, 42);

        spy.wasCalledWith(Spy.IGNORE, Spy.IGNORE); // this is typically non-sense, but test it anyway
        spy.wasCalledWith(Spy.IGNORE, 42);
        spy.wasCalledWith({ _key: Spy.IGNORE, prop: 'whatever' }, 42);
        spy.wasCalledWith({ _key: Spy.IGNORE, prop: 'whatever' }, Spy.IGNORE);
        spy.wasCalledWith({ _key: Spy.IGNORE, prop: Spy.IGNORE }, Spy.IGNORE);
        throws(() =>
            spy.wasCalledWith({ _key: Spy.IGNORE, prop: 'FAILURE' }, Spy.IGNORE)
        );
    });

    it('should call the given input-functions sequentially after the spy was called', () => {
        const testObj = { _key: 'testObj' };
        const spy = new Spy().calls(
            arg => {
                testObj._key = arg;
                return null;
            },
            arg => {
                testObj._key = 'some other ' + arg;
                return 42;
            }
        );
        equals(spy('callParams1'), null);
        equals(testObj._key, 'callParams1');
        equals(spy('callParams2'), 42);
        equals(testObj._key, 'some other callParams2');
        equals(spy('callParams3'), 42);
        equals(testObj._key, 'some other callParams3');
    });

    it('should make the spy transparent (mainly for spies on object properties)', () => {
        const testObject = { someFunc: errorThrower };
        const spy = Spy.on(testObject, 'someFunc').transparent();
        throws(() => testObject.someFunc('test', 6), {
            message: 'never call this func directly',
        });
        spy.wasCalledWith('test', 6);
    });

    it('should make the spy transparent after a certain amount of calls', () => {
        const testObject = { someFunc: errorThrower };
        const spy = Spy.on(testObject, 'someFunc')
            .returns(12, 13)
            .transparentAfter(2);
        equals(testObject.someFunc('test1', 42), 12);
        equals(testObject.someFunc('test2'), 13);
        throws(() => testObject.someFunc('test3', { testProp: 'test' }), {
            message: 'never call this func directly',
        });
        throws(() => testObject.someFunc('test4'), {
            message: 'never call this func directly',
        });

        spy.wasCalled(4);
        spy.wasCalledWith('test1', 42);
        spy.wasCalledWith('test2');
        spy.wasCalledWith('test3', { testProp: 'test' });
        spy.wasCalledWith('test4');
    });

    it('checks the call history', () => {
        const testObject = { someFunc: errorThrower };
        const spy: any = Spy.on(testObject, 'someFunc');
        testObject.someFunc('test1', 42);
        testObject.someFunc();
        testObject.someFunc('test3');
        testObject.someFunc('test4');

        spy.wasCalled(4);
        throws(
            () => spy.hasCallHistory([['test1', 42], ['test3'], ['test4']]),
            {
                partOfMessage:
                    "the spy on 'someFunc' was called 4 times, but the expected call history includes exactly 3 calls.",
            }
        );
        throws(
            () => spy.hasCallHistory([['test1', 42], [], ['test4'], ['test3']]),
            {
                partOfMessage: '--> 0 / different string',
            }
        );
        throws(
            () =>
                spy.hasCallHistory([
                    ['test1', 42],
                    ['foo'],
                    ['test3'],
                    ['test4'],
                ]),
            {
                partOfMessage: '--> 0 / one was undefined',
            }
        );
        spy.hasCallHistory([['test1', 42], [], ['test3'], ['test4']]);
    });

    it('should do nothing after for transparent restored spy', () => {
        const testObject = { someFunc: errorThrower };
        const spy: any = Spy.on(testObject, 'someFunc').transparentAfter(3);
        testObject.someFunc('test1', 42);
        testObject.someFunc();
        testObject.someFunc();
        throws(() => testObject.someFunc('test4'), {
            message: 'never call this func directly',
        });
        throws(() => testObject.someFunc('test5'), {
            message: 'never call this func directly',
        });

        spy.wasCalled(5);
        spy.wasCalledWith('test1', 42);
        spy.wasCalledWith('test4');
        spy.wasCalledWith('test5');
        spy.wasNotCalledWith('test6');

        spy.restore();

        throws(() => testObject.someFunc('test6'), {
            message: 'never call this func directly',
        });

        spy.wasCalled(5);

        equals(spy('test7'), undefined);
    });

    /**
     * Test class.
     */
    class TestClass {
        attr: number;
        constructor(attr: number) {
            // eslint-disable-line require-jsdoc
            this.attr = attr;
        }
        equals(other: TestClass): boolean {
            // eslint-disable-line
            // returning true if both attr are odd or both are even
            return !((this.attr - other.attr) % 2);
        }
    }

    const testInstance1 = new TestClass(2);
    const testInstance2 = new TestClass(2);
    const testInstance3 = new TestClass(4);
    const testInstance4 = new TestClass(5);

    it('should use own "equals" implementations as default, but is able to reconfigure this behaviour', () => {
        const spy = new Spy();

        spy(testInstance1);

        // default config
        spy.wasCalledWith(testInstance1);
        spy.wasCalledWith(testInstance2);
        spy.wasCalledWith(testInstance3);
        spy.wasNotCalledWith(testInstance4);

        spy.configure({ useOwnEquals: false });

        // after configuration
        spy.wasCalledWith(testInstance1);
        spy.wasCalledWith(testInstance2);
        spy.wasNotCalledWith(testInstance3);
        spy.wasNotCalledWith(testInstance4);
    });

    it('does override the default behaviour for the use of own "equals" implementations. ', () => {
        const testObj1 = { func1: noop };
        const testObj2 = { func2: noop };
        const testObj3 = { func3: noop };
        // still the initial default config
        const defaultSpy1 = new Spy('defaultSpy1');
        // using configure without the "useOwnEquals"-config
        // does not effect the behaviour
        Spy.configure({});
        const defaultSpy2 = Spy.on(testObj1, 'func1');

        // make the new configuration for all spies
        Spy.configure({ useOwnEquals: false });
        const configuredSpy1 = new Spy('configuredSpy1');
        const configuredSpy2 = Spy.on(testObj2, 'func2');

        // configure it back to the initial config
        Spy.configure({ useOwnEquals: true });
        const reconfiguredSpy1 = new Spy('reconfiguredSpy1');
        const reconfiguredSpy2 = Spy.on(testObj3, 'func3');

        // call all spies with the same object
        defaultSpy1(testInstance1);
        testObj1.func1(testInstance1);
        configuredSpy1(testInstance1);
        testObj2.func2(testInstance1);
        reconfiguredSpy1(testInstance1);
        testObj3.func3(testInstance1);

        const wasCalledChecksForOwnEquals = (spy: Spy) => {
            // default config
            spy.wasCalledWith(testInstance1);
            spy.wasCalledWith(testInstance2);
            spy.wasCalledWith(testInstance3);
            spy.wasNotCalledWith(testInstance4);
        };

        const wasCalledChecksForNotOwnEquals = (spy: Spy) => {
            // after configuration
            spy.wasCalledWith(testInstance1);
            spy.wasCalledWith(testInstance2);
            spy.wasNotCalledWith(testInstance3);
            spy.wasNotCalledWith(testInstance4);
        };

        wasCalledChecksForOwnEquals(defaultSpy1);
        wasCalledChecksForOwnEquals(defaultSpy2);

        wasCalledChecksForNotOwnEquals(configuredSpy1);
        wasCalledChecksForNotOwnEquals(configuredSpy2);

        wasCalledChecksForOwnEquals(reconfiguredSpy1);
        wasCalledChecksForOwnEquals(reconfiguredSpy2);
    });

    it('does not allow direct access to the internal properties of each Spy', () => {
        const testObj = { myFunc: () => {} };
        const spy = Spy.on(testObj, 'myFunc');

        const allowedProps = [
            'configure',
            'calls',
            'returns',
            'throws',
            'reset',
            'restore',
            'transparent',
            'transparentAfter',
            'wasCalled',
            'wasNotCalled',
            'wasCalledWith',
            'wasNotCalledWith',
            'hasCallHistory',
            'getCallArguments',
            'getCallArgument',
            'getCallCount',
            'showCallArguments',
        ];

        for (let prop in spy) {
            // eslint-disable-line
            let propUnknown = true;
            for (let i = 0; i < allowedProps.length; i++) {
                if (prop === allowedProps[i]) {
                    propUnknown = false;
                }
            }
            if (propUnknown) {
                throw new Error('Received not allowed prop: ' + prop);
            }
        }
    });

    it('does not allow to configure not mocking spies to be persistent', () => {
        const spy = new Spy('spy that does not mock any object');

        throws(() => spy.configure({ persistent: true }), {
            partOfMessage: 'does not mock any object',
        });
        throws(() => spy.configure({ persistent: false }), {
            partOfMessage: 'does not mock any object',
        });
    });

    it('does not allow to restore persistent spies', () => {
        const testObj = { myFunc: () => 'originalFunc' };
        const spy = Spy.on(testObj, 'myFunc').configure({ persistent: true });

        throws(() => spy.restore(), {
            partOfMessage: 'was configured to be persistent',
        });

        spy.configure({ persistent: false });
        equals(testObj.myFunc(), undefined);

        spy.restore();
        equals(testObj.myFunc(), 'originalFunc');
    });

    it('does not restore persistent spies when restoreAll gets called', () => {
        const testObj = { myFunc1: () => 'func1', myFunc2: () => 'func2' };
        const spy1 = Spy.on(testObj, 'myFunc1')
            .configure({ persistent: true })
            .returns('spy1');
        Spy.on(testObj, 'myFunc2').returns('spy2');

        equals(testObj.myFunc1(), 'spy1');
        equals(testObj.myFunc2(), 'spy2');

        Spy.restoreAll();

        equals(testObj.myFunc1(), 'spy1');
        equals(testObj.myFunc2(), 'func2');

        spy1.configure({ persistent: false });

        Spy.restoreAll();

        equals(testObj.myFunc1(), 'func1');
        equals(testObj.myFunc2(), 'func2');
    });
});
