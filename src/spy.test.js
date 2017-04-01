/*
 * @flow
 */

import {equals, throws} from './test-utils/test.utils';
import {Spy} from './spy';

describe('Spy - Utils', () => {
    afterEach(Spy.restoreAll);

    it('should not allow to use the constructor of the Spy without new', () => {
        throws(Spy);
    });

    it('should call the Spy and record the call arguments', () => {
        const spy = new Spy();
        const someDate = new Date();
        spy(9, 'test', someDate);
        equals(spy.getCallArguments(), [9, 'test', someDate]);
        // and more general
        spy.wasCalledWith(9, 'test', someDate);
    });

    it('should place the Spy on an object and ' +
        'record the call arguments', () => {
        const testObject = {someFunc: () => {
            throw new Error('never call this func directly');
        }};
        const spy = Spy.on(testObject, 'someFunc');
        const someDate = new Date();
        testObject.someFunc('test', 6, someDate);
        equals(spy.getCallArguments(), ['test', 6, someDate]);
        // and more general
        spy.wasCalledWith('test', 6, someDate);
    });

    it('should throw if trying to spy other attributes ' +
        'than functions', () => {
        const testObject = {
            attrString: 'string',
            attrNumber: 12,
            attrNull: null,
            attrDate: new Date(),
            attrObject: {}};
        throws(() => Spy.on(testObject, 'attrString'));
        throws(() => Spy.on(testObject, 'attrNumber'));
        throws(() => Spy.on(testObject, 'attrNull'));
        throws(() => Spy.on(testObject, 'attrDate'));
        throws(() => Spy.on(testObject, 'attrObject'));
        throws(() => Spy.on(testObject, 'attrUnknown'));
    });

    it('should throw if trying to spy on already spied attributes.', () => {
        const testObject = {attr: () => {}};
        const firstSpy = Spy.on(testObject, 'attr');
        // spying again does throw now
        throws(() => Spy.on(testObject, 'attr'));
        // after restoring the spy, we can spy there again
        firstSpy.restore();
        Spy.on(testObject, 'attr');
    });

    it('should place many Spies on an object and ' +
        'record different call arguments', (cb) => {
        const errorThrower = () => {
            throw new Error('never call this func directly');
        };
        const testObject = {
            func1: errorThrower,
            func2: errorThrower,
            func3: () => cb(),
            func4: errorThrower};
        const [spy1, spy2, spy3] =
            Spy.onMany(testObject, 'func1', 'func2', 'func4');
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

    it('should restore all Spies', (cb) => {
        const errorThrower = () => {
            throw new Error('never call this func directly');
        };
        const testObject = {
            func1: () => {},
            func2: errorThrower,
            func3: () => cb(),
            func4: errorThrower};
        const [spy1, spy2] =
            Spy.onMany(testObject, 'func1', 'func2', 'func3', 'func4');
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

    it('should restore single Spies', (cb) => {
        const errorThrower = () => {
            throw new Error('never call this func directly');
        };
        const testObject = {
            func1: () => {},
            func2: errorThrower,
            func3: () => cb(),
            func4: errorThrower};
        const [spy1,, spy3] =
            Spy.onMany(testObject, 'func1', 'func2', 'func3', 'func4');
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
        spy({_key: 'test'});
        spy.wasCalledWith({_key: 'test'});
        throws(spy.wasNotCalled);
    });

    it('should inspect calls for given arguments of the Spy correctly', () => {
        const spy = new Spy();
        const testArg1 = {_key: 'test1'};
        const testArg2 = {_key: 'test2'};
        const testArg3 = {_key: 'test3'};
        spy(testArg1);
        spy(testArg1, testArg2);
        spy(testArg3, testArg2, testArg1);
        spy(testArg2);
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
        const testArg1 = {_key: 'test1'};
        const testArg2 = {_key: 'test2'};
        const testArg3 = {_key: 'test3'};
        spy(testArg1);
        spy(testArg1, testArg2);
        spy(testArg3, testArg2, testArg1);
        spy(testArg2);

        equals(spy.getCallArguments(), [testArg1]);
        equals(spy.getCallArguments(0), [testArg1]);
        equals(spy.getFirstCallArgument(), testArg1);
        equals(spy.getFirstCallArgument(0), testArg1);

        equals(spy.getCallArguments(1), [testArg1, testArg2]);
        equals(spy.getFirstCallArgument(1), testArg1);

        equals(spy.getCallArguments(2), [testArg3, testArg2, testArg1]);
        equals(spy.getFirstCallArgument(2), testArg3);

        equals(spy.getCallArguments(3), [testArg2]);
        equals(spy.getFirstCallArgument(3), testArg2);
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
        spy({_key: 'myTestArguments'});
        spy({_key: 'someOtherArguments'}, 42);
        const displayString = spy.showCallArguments();
        throws(() => equals(displayString.indexOf('myTestArguments'), -1));
        throws(() => equals(displayString.indexOf('someOtherArguments'), -1));
        throws(() => equals(displayString.indexOf('42'), -1));
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
        const testObj = {_key: 'testObj'};
        const spy = new Spy().returns(testObj);
        equals(spy({_key: 'callParams1'}), testObj);
        equals(spy({_key: 'callParams2'}), testObj);
    });

    it('should return given inputs sequentially' +
        ' after the spy was called', () => {
        const testObj1 = {_key: 'testObj1'};
        const testObj2 = {_key: 'testObj2'};
        const testObj3 = {_key: 'testObj3'};
        const spy = new Spy().returns(testObj1, testObj2, testObj3);
        equals(spy({_key: 'callParams1'}), testObj1);
        equals(spy({_key: 'callParams2'}), testObj2);
        equals(spy({_key: 'callParams3'}), testObj3);
        equals(spy({_key: 'callParams4'}), testObj3);
    });

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
        throws(() => spy({_key: 'callParams1'}), 'errorMessage');
        spy.throws(null);
        throws(() => spy({_key: 'callParams2'}));
    });

    it('should reset the call arguments on an object' +
        ' spy and NOT removing it (LIKE RESTORE)', (cb) => {
        const testObject = {func: () => cb()};
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
        const testObj = {_key: 'testObj'};
        const spy = new Spy().calls((arg) => {
            testObj._key = arg;
            return null;
        });
        equals(spy('callParams1'), null);
        equals(testObj._key, 'callParams1');
    });

    it('should call the given input-functions ' +
        'sequentially after the spy was called', () => {
        const testObj = {_key: 'testObj'};
        const spy = new Spy().calls((arg) => {
            testObj._key = arg;
            return null;
        }, (arg) => {
            testObj._key = 'some other ' + arg;
            return 42;
        });
        equals(spy('callParams1'), null);
        equals(testObj._key, 'callParams1');
        equals(spy('callParams2'), 42);
        equals(testObj._key, 'some other callParams2');
        equals(spy('callParams3'), 42);
        equals(testObj._key, 'some other callParams3');
    });

    it('should make the spy transparent' +
        ' (mainly for spies on object properties)', () => {
        const testObject = {someFunc: () => {
            throw new Error('never call this func directly');
        }};
        const spy = Spy.on(testObject, 'someFunc').transparent();
        throws(() => testObject.someFunc('test', 6));
        spy.wasCalledWith('test', 6);
    });

    it('should make the spy transparent after' +
        ' a certain amount of calls', () => {
        const testObject = {someFunc: () => {
            throw new Error('never call this func directly');
        }};
        const spy = Spy.on(testObject, 'someFunc')
                       .returns(12, 13).transparentAfter(2);
        equals(testObject.someFunc('test1', 42), 12);
        equals(testObject.someFunc('test2'), 13);
        throws(() => testObject.someFunc('test3', {testProp: 'test'}));
        throws(() => testObject.someFunc('test4'));

        spy.wasCalled(4);
        spy.wasCalledWith('test1', 42);
        spy.wasCalledWith('test2');
        spy.wasCalledWith('test3', {testProp: 'test'});
        spy.wasCalledWith('test4');
    });

    it('should do nothing after for transparent restored spy', () => {
        const testObject = {someFunc: () => {
            throw new Error('never call this func directly');
        }};
        const spy:any = Spy.on(testObject, 'someFunc').transparentAfter(3);
        testObject.someFunc('test1', 42);
        testObject.someFunc();
        testObject.someFunc();
        throws(() => testObject.someFunc('test4'));
        throws(() => testObject.someFunc('test5'));

        spy.restore();

        throws(() => testObject.someFunc('test6'));

        spy.wasCalled(5);
        spy.wasCalledWith('test1', 42);
        spy.wasCalledWith('test4');
        spy.wasCalledWith('test5');
        spy.wasNotCalledWith('test6');

        equals(spy('test7'), undefined);
    });

    it('should use own "equals" implementations as default, ' +
        'but is able to reconfigure this behaviour', () => {
        const TestClass = class {
            attr:number;
            constructor(attr:number) { // eslint-disable-line require-jsdoc
                this.attr = attr;
            }
            equals(other:TestClass):boolean { // eslint-disable-line
                // returning true if both attr are odd or both are even
                return !((this.attr - other.attr) % 2);
            }
        };
        const test1 = new TestClass(2);
        const test2 = new TestClass(2);
        const test3 = new TestClass(4);
        const test4 = new TestClass(5);

        const spy = new Spy();

        spy(test1);

        // default config
        spy.wasCalledWith(test1);
        spy.wasCalledWith(test2);
        spy.wasCalledWith(test3);
        spy.wasNotCalledWith(test4);

        spy.configure({useOwnEquals: false});

        // after configuration
        spy.wasCalledWith(test1);
        spy.wasCalledWith(test2);
        spy.wasNotCalledWith(test3);
        spy.wasNotCalledWith(test4);
    });

    it('does not allow direct access to the internal ' +
        'properties of each Spy', () => {
        const testObj = {myFunc: () => {}};
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
            'getCallArguments',
            'getFirstCallArgument',
            'getCallCount',
            'showCallArguments'];

        for (let prop in spy) {
            if (!allowedProps.includes(prop)) {
                throw new Error('Received not allowed prop: ' + prop);
            }
        }
    });

    it('does not allow to configure not mocking spies to be persistent', () => {
        const spy = new Spy('spy that does not mock any object');

        throws(() => spy.configure({persistent: true}));
        throws(() => spy.configure({persistent: false}));
    });

    it('does not allow to restore persistent spies', () => {
        const testObj = {myFunc: () => 'originalFunc'};
        const spy = Spy.on(testObj, 'myFunc').configure({persistent: true});

        throws(spy.restore);

        spy.configure({persistent: false});
        equals(testObj.myFunc(), undefined);

        spy.restore();
        equals(testObj.myFunc(), 'originalFunc');
    });

    it('does not restore persistent spies when restoreAll gets called', () => {
        const testObj = {myFunc1: () => 'func1', myFunc2: () => 'func2'};
        const spy1 = Spy.on(testObj, 'myFunc1')
                        .configure({persistent: true})
                        .returns('spy1');
        Spy.on(testObj, 'myFunc2').returns('spy2');

        equals(testObj.myFunc1(), 'spy1');
        equals(testObj.myFunc2(), 'spy2');

        Spy.restoreAll();

        equals(testObj.myFunc1(), 'spy1');
        equals(testObj.myFunc2(), 'func2');

        spy1.configure({persistent: false});

        Spy.restoreAll();

        equals(testObj.myFunc1(), 'func1');
        equals(testObj.myFunc2(), 'func2');
    });
});
