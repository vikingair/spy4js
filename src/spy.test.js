/*
 * @flow
 */

import expect from 'expect';
import {Spy} from './spy';

describe('Spy - Utils', () => {
    it('should not allow to use the constructor of the Spy without new', () => {
        expect(() => Spy()).toThrow(); // eslint-disable-line
    });

    it('should call the Spy and record the call arguments', () => {
        const spy = new Spy();
        expect(spy).toExist();
        const someDate = new Date();
        spy(9, 'test', someDate);
        expect(spy.getCallArguments()).toEqual([9, 'test', someDate]);
        // and more general
        spy.wasCalledWith(9, 'test', someDate);
    });

    it('should place the Spy on an object and ' +
        'record the call arguments', () => {
        const testObject = {someFunc: () => {
            throw new Error('never call this func directly');
        }};
        const spy = Spy.on(testObject, 'someFunc');
        expect(spy).toExist();
        const someDate = new Date();
        testObject.someFunc('test', 6, someDate);
        expect(spy.getCallArguments()).toEqual(['test', 6, someDate]);
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
        expect(() => Spy.on(testObject, 'attrString')).toThrow();
        expect(() => Spy.on(testObject, 'attrNumber')).toThrow();
        expect(() => Spy.on(testObject, 'attrNull')).toThrow();
        expect(() => Spy.on(testObject, 'attrDate')).toThrow();
        expect(() => Spy.on(testObject, 'attrObject')).toThrow();
        expect(() => Spy.on(testObject, 'attrUnknown')).toThrow();
    });

    it('should throw if trying to spy on already spied attributes.', () => {
        const testObject = {attr: () => {}};
        const firstSpy = Spy.on(testObject, 'attr');
        // spying again does throw now
        expect(() => Spy.on(testObject, 'attr')).toThrow();
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
        expect(spy1.getCallArguments()).toEqual(['test', 6]);
        spy1.wasCalledWith('test', 6);
        testObject.func2('', 7);
        expect(spy2.getCallArguments()).toEqual(['', 7]);
        spy2.wasCalledWith('', 7);
        testObject.func4();
        expect(spy3.getCallArguments()).toEqual([]);
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
        expect(() => testObject.func2('testCall6')).toThrow();
        spy1.wasCalledWith('testCall1');
        expect(() => spy1.wasCalledWith('testCall5')).toThrow();
        expect(() => spy2.wasCalledWith('testCall6')).toThrow();
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
        expect(() => spy1.wasCalledWith('testCall5')).toThrow();

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
        expect(() => spy.wasNotCalled()).toThrow();
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
        expect(() => spy.wasCalled(2)).toThrow();
        spy.wasCalled(4);
        spy.wasCalledWith(testArg1);
        expect(() => spy.wasNotCalledWith(testArg1)).toThrow();
        spy.wasCalledWith(testArg2);
        expect(() => spy.wasNotCalledWith(testArg2)).toThrow();
        spy.wasCalledWith(testArg1, testArg2);
        expect(() => spy.wasNotCalledWith(testArg1, testArg2)).toThrow();
        spy.wasCalledWith(testArg3, testArg2, testArg1);
        expect(() => spy.wasNotCalledWith(testArg3, testArg2, testArg1))
            .toThrow();
        expect(() => spy.wasCalledWith(testArg3)).toThrow();
        spy.wasNotCalledWith(testArg3);
        expect(() => spy.wasCalledWith(testArg3, testArg2)).toThrow();
        spy.wasNotCalledWith(testArg3, testArg2);
        expect(() => spy.wasCalledWith(testArg3, testArg1, testArg2)).toThrow();
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

        expect(spy.getCallArguments()).toEqual([testArg1]);
        expect(spy.getCallArguments(0)).toEqual([testArg1]);
        expect(spy.getFirstCallArgument()).toBe(testArg1);
        expect(spy.getFirstCallArgument(0)).toBe(testArg1);

        expect(spy.getCallArguments(1)).toEqual([testArg1, testArg2]);
        expect(spy.getFirstCallArgument(1)).toBe(testArg1);

        expect(spy.getCallArguments(2)).toEqual([testArg3, testArg2, testArg1]);
        expect(spy.getFirstCallArgument(2)).toBe(testArg3);

        expect(spy.getCallArguments(3)).toEqual([testArg2]);
        expect(spy.getFirstCallArgument(3)).toBe(testArg2);
    });

    it('should return call arguments in an appropriate display string', () => {
        const spy = new Spy();
        spy.wasNotCalled();
        spy({_key: 'myTestArguments'});
        spy({_key: 'someOtherArguments'}, 42);
        const displayString = spy.showCallArguments();
        expect(displayString.indexOf('myTestArguments')).toNotBe(-1);
        expect(displayString.indexOf('someOtherArguments')).toNotBe(-1);
        expect(displayString.indexOf('42')).toNotBe(-1);
    });

    it('should return undefined if no return value is supplied', () => {
        const spy = new Spy().returns();
        expect(spy('callParams1')).toBe(undefined);
        spy.returns(42);
        expect(spy('callParams2')).toBe(42);
        spy.returns();
        expect(spy('callParams3')).toBe(undefined);
    });

    it('should return given inputs after the spy was called', () => {
        const testObj = {_key: 'testObj'};
        const spy = new Spy().returns(testObj);
        expect(spy({_key: 'callParams1'})).toBe(testObj);
        expect(spy({_key: 'callParams2'})).toBe(testObj);
    });

    it('should return given inputs sequentially' +
        ' after the spy was called', () => {
        const testObj1 = {_key: 'testObj1'};
        const testObj2 = {_key: 'testObj2'};
        const testObj3 = {_key: 'testObj3'};
        const spy = new Spy().returns(testObj1, testObj2, testObj3);
        expect(spy({_key: 'callParams1'})).toBe(testObj1);
        expect(spy({_key: 'callParams2'})).toBe(testObj2);
        expect(spy({_key: 'callParams3'})).toBe(testObj3);
        expect(spy({_key: 'callParams4'})).toBe(testObj3);
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
        expect(() => spy({_key: 'callParams1'})).toThrow('errorMessage');
        spy.throws(null);
        expect(() => spy({_key: 'callParams2'})).toThrow();
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
        expect(() => spy.wasCalledWith('testCall1')).toThrow();

        spy.restore();
        // if this would get spied, the test callback
        // would never be called which would make the test fail
        testObject.func('testCall3');
    });

    it('should call NOP if no input-function is supplied', () => {
        const spy = new Spy().calls();
        expect(spy('callParams1')).toBe(undefined);
        spy.calls(() => 42);
        expect(spy('callParams2')).toBe(42);
        spy.calls();
        expect(spy('callParams3')).toBe(undefined);
    });

    it('should call the given input-function after the spy was called', () => {
        const testObj = {_key: 'testObj'};
        const spy = new Spy().calls((arg) => {
            testObj._key = arg;
            return null;
        });
        expect(spy('callParams1')).toBe(null);
        expect(testObj._key).toBe('callParams1');
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
        expect(spy('callParams1')).toBe(null);
        expect(testObj._key).toBe('callParams1');
        expect(spy('callParams2')).toBe(42);
        expect(testObj._key).toBe('some other callParams2');
        expect(spy('callParams3')).toBe(42);
        expect(testObj._key).toBe('some other callParams3');
    });

    it('should make the spy transparent' +
        ' (mainly for spies on object properties)', () => {
        const testObject = {someFunc: () => {
            throw new Error('never call this func directly');
        }};
        const spy = Spy.on(testObject, 'someFunc').transparent();
        expect(() => testObject.someFunc('test', 6)).toThrow();
        spy.wasCalledWith('test', 6);
    });

    it('should make the spy transparent after' +
        ' a certain amount of calls', () => {
        const testObject = {someFunc: () => {
            throw new Error('never call this func directly');
        }};
        const spy = Spy.on(testObject, 'someFunc')
                       .returns(12, 13).transparentAfter(2);
        expect(testObject.someFunc('test1', 42)).toBe(12);
        expect(testObject.someFunc('test2')).toBe(13);
        expect(() => testObject.someFunc('test3', {testProp: 'test'}))
            .toThrow();
        expect(() => testObject.someFunc('test4')).toThrow();

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
        expect(() => testObject.someFunc('test4')).toThrow();
        expect(() => testObject.someFunc('test5')).toThrow();

        spy.restore();

        expect(() => testObject.someFunc('test6')).toThrow();

        spy.wasCalled(5);
        spy.wasCalledWith('test1', 42);
        spy.wasCalledWith('test4');
        spy.wasCalledWith('test5');
        spy.wasNotCalledWith('test6');

        expect(spy('test7')).toBe(undefined);
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
});
