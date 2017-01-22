/*
 * @flow
 */

import {differenceOf} from './equality';
import {SpyRegistry} from './registry';

/**
 *
 * Instantiating the SpyRegistry to handle all
 * mocked object relative information and
 * restore their functionality if requested.
 *
 */
const registry = new SpyRegistry();

/**
 * @ModifiedOnly by viktor.luft@freiheit.com
 *
 * This class is a stand-alone spy-framework.
 * Do not edit it. Please feel free to use it and report me
 * nice additional feature wishes. This class will be moved
 * to GitHub and can be accessed via npm later.
 *
 */
const Spy = (function() {
    /**
     * This constructor does instantiate a new spy
     * object.
     *
     * This spy is callable.
     * It does inherit all Spy specific methods below.
     * It holds additional (private) fields:
     * _name:string -> Will be displayed in all displayed
     *                 error messages.
     * _isSpy:boolean -> Always true for spies.
     * _func:Function -> The internal function, that will
     *                   actually we called, when calling
     *                   the spy.
     * _calls:Array<{arguments:Array<any>}>
     *     -> Stores the arguments with whom the spy was called.
     *        Each call adds another entry in the calls array.
     * _config = {useOwnEquals: boolean} -> internal spy config.
     *
     *
     * @param {string} name -> the identifier of the spy.
     *                       Useful for debugging issues.
     * @constructor
     */
    function Spy(name:string = 'the spy') {
        if (!(this instanceof Spy)) {
            throw new Error('\n\nPlease make sure to use this ' +
                'constructor only with "new" keyword.\n\n');
        }
        let spy:any = function(...args:Array<any>) {
            spy._calls.push({arguments: args});
            return spy._func(...args);
        };
        spy._name = name;
        spy._isSpy = true;
        spy._func = () => {};
        spy._calls = [];
        spy._config = {useOwnEquals: true};
        for (let key in Spy.prototype) {
            if (Spy.prototype instanceof Object &&
                Spy.prototype.hasOwnProperty(key)) {
                spy[key] = Spy.prototype[key];
            }
        }
        return spy;
    }

    /**
     *
     * This static method is an alternative way to
     * create a Spy which mocks the an objects attribute.
     *
     * The attribute of the object "obj[methodName]" will
     * be replaced by the spy and the previous attribute
     * will be stored in the spy registry.
     * Therefore this information is always restorable.
     * The most common use case, will be to mock
     * another function as attribute of the object.
     *
     * The method has to met the following conditions:
     *
     * - The attribute to spy has to be function itself.
     * - The attribute to spy should not be spied already.
     *
     * If the upper conditions are not fulfilled, this
     * method will throw to avoid unexpected behaviour.
     *
     * @param {Object} obj -> The manipulated object.
     * @param {string} methodName -> The mocked attributes name.
     *
     * @return {Spy}
     */
    Spy.on = function on(obj:Object, methodName:string):Spy {
        const spy = new Spy('the spy on \'' + methodName + '\'');
        const method = obj[methodName];
        if (!(method instanceof Function)) {
            throw new Error(`The object attribute '${methodName}' ` +
                `was: ${JSON.stringify(method)}\n\n` +
                'You should only spy on functions!');
        }
        if (method._isSpy) {
            throw new Error(`The objects attribute '${methodName}'` +
                ' was already spied. Please make sure to spy' +
                ' only once at a time at any attribute.');
        }
        spy._index = registry.push(obj, methodName);
        obj[methodName] = spy;
        return spy;
    };

    /**
     * This static method is shortcut for applying multiple
     * spies on one object at (different) attributes.
     *
     * For example:
     *
     * const spy1 = Spy.on(obj, 'methodName1');
     * const spy2 = Spy.on(obj, 'methodName2');
     * const spy3 = Spy.on(obj, 'methodName3');
     *
     * Is equivalent to:
     *
     * const [spy1, spy2, spy3] =
     *      Spy.onMany(obj, 'methodName1', 'methodName2', 'methodName3')
     *
     * @param {Object} obj -> The manipulated object.
     * @param {Array<string>} methodNames -> Iterative provided attribute
     *                                       names that will be mocked.
     *
     * @return {Array<Spy>}
     */
    Spy.onMany = function onMany(
        obj:Object, ...methodNames:Array<string>
    ):Array<Spy> {
        const spies = [];
        for (let i = 0; i < methodNames.length; i++) {
            const spy = Spy.on(obj, methodNames[i]);
            spies.push(spy);
        }
        return spies;
    };

    /**
     * This static method does restore all
     * manipulated objects and remove therefore
     * all mocks.
     *
     * Restoring objects does not disable any
     * other behaviours/features of the spies.
     */
    Spy.restoreAll = function restoreAll():void {
        registry.restoreAll();
    };

    /**
     * Configures this spy behaviour in a special
     * way. Passing in an object that contains
     * meaningful attributes can configure:
     *
     * - useOwnEquals:boolean -> toggles the usage of own
     *                           implementation of "equals"
     *                           matcher, e.g. for comparing
     *                           call params with "wasCalledWith".
     *
     * @param {Object} config <- An object containing attributes
     *                         for special configuration
     * @return {Spy} <- BuilderPattern.
     */
    Spy.prototype.configure = function(
        config:{useOwnEquals: boolean|void}
    ):Spy {
        if (config.useOwnEquals !== undefined) {
            this._config.useOwnEquals = config.useOwnEquals;
        }
        return this;
    };

    /**
     * Accepts multiple functions. If called more often,
     * calling always the last supplied function.
     *
     * @param {Array<Function>} funcs
     *     -> The iterative provided functions
     *        can be accessed as array.
     *        And will be called one by one
     *        for each made call on the spy.
     *
     * @return {Spy} <- BuilderPattern.
     */
    Spy.prototype.calls = function(...funcs:Array<Function>):Spy {
        if (funcs.length === 0) { // no arguments provided
            this._func = () => {};
            return this;
        }

        const max = funcs.length - 1;
        let counter = -1;

        this._func = (...args:Array<any>) => {
            counter++;
            return funcs[max < counter ? max : counter](...args);
        };

        return this;
    };

    /**
     * Accepts multiple return values. If called more often,
     * returns always the last supplied return value.
     *
     * @param {Array<any>} args -> The iterative provided arguments
     *                             can be accessed as array.
     *                             And will be returned one by one
     *                             for each made call.
     *
     * @return {Spy} <- BuilderPattern.
     */
    Spy.prototype.returns = function(...args:Array<any>):Spy {
        const funcs = [];

        for (let i = 0; i < args.length; i++) {
            funcs.push(() => args[i]);
        }

        return this.calls(...funcs);
    };

    /**
     * Will make the spy throw an Error, if called next time.
     * The error message can be provided as parameter.
     *
     * @param {?string} message -> Will be the error message.
     *
     * @return {Spy} <- BuilderPattern
     */
    Spy.prototype.throws = function(message:?string):Spy {
        this._func = () => {
            throw new Error(message || `${this._name} was requested to throw`);
        };
        return this;
    };

    /**
     * Deletes all notices of made calls with this spy.
     *
     * @return {Spy} <- BuilderPattern
     */
    Spy.prototype.reset = function():Spy {
        this._calls = [];
        return this;
    };

    /**
     * Restores the last by this spy manipulated object
     * and removes this special mock.
     *
     * Restoring objects does not disable any
     * other behaviours/features of the spies.
     *
     * Other than "Spy.restoreAll" this method only removes
     * a maximum of one mock.
     *
     * @return {Spy} <- BuilderPattern
     */
    Spy.prototype.restore = function():Spy {
        registry.restore(this._index);
        return this;
    };

    /**
     * Makes the spy behave like the mocked
     * function. If no function was mocked by
     * this spy, it will do nothing if called.
     *
     * This function works exactly like
     * Spy.prototype.transparentAfter(0).
     *
     * For example:
     * const spy = Spy.on(someObject, 'someFunc');
     * someObject.someFunc(); // calls only the spy
     * spy.transparent();
     * someObject.someFunc(); // behaves like calling the original method
     *
     * @return {Spy} <- BuilderPattern
     */
    Spy.prototype.transparent = function():Spy {
        return this.transparentAfter(0);
    };

    /**
     * If called with n as callCount this will make
     * the spy call the mocked function after called
     * the n'th time. For any spy that does not mock
     * any objects attribute, this will make the spy
     * do nothing if called after the n'th time.
     *
     * If the mocked function will get called again,
     * the made calls will still be registered.
     *
     * For example:
     * Spy.on(someObject, 'someFunc').transparentAfter(2);
     * someObject.someFunc(); // calls only the spy
     * someObject.someFunc(); // calls only the spy
     * someObject.someFunc(); // behaves like calling the original method
     *
     * @param {number} callCount <- The number after which the mocked function
     *                              should be called again.
     *
     * @return {Spy} <- BuilderPattern
     */
    Spy.prototype.transparentAfter = function(callCount:number):Spy {
        const oldFunc = this._func;
        this._func = (...args) => {
            // before the function call is executed,
            // the call arguments were already saved
            // -> so we are interested if the made calls
            //    are more than the call count were we
            //    need to modify the behavior
            if (this._calls.length > callCount) {
                const originalMethod = registry.getOriginalMethod(this._index);
                if (originalMethod) {
                    return originalMethod(...args);
                }
                return;
            }
            return oldFunc(...args);
        };
        return this;
    };

    /**
     * Checks if the spy was called callCount times often.
     *
     * If callCount = 0 - which is the default - then it only
     * checks if the spy was called at least once.
     *
     * Throws an error if the expectation is wrong.
     *
     * @param {?number} callCount -> Is the number of expected calls made.
     */
    Spy.prototype.wasCalled = function(callCount:number = 0) {
        const madeCalls = this._calls.length;
        if (callCount) {
            if (madeCalls !== callCount) {
                throw new Error(
                    `\n\n${this._name} was called ${madeCalls} times,` +
                    ` but there were expected ${callCount} calls.\n\n`
                );
            }
        } else if (madeCalls === 0) {
            throw new Error(`\n\n${this._name} was never called!\n\n`);
        }
    };

    /**
     * Checks that the spy was never called.
     * Throws an error if the spy was called at least once.
     */
    Spy.prototype.wasNotCalled = function() {
        const madeCalls = this._calls;
        if (madeCalls.length !== 0) {
            throw new Error(
                `\n\nExpected no calls for ${this._name}.\n\n` +
                'Actually there were:\n\n' + this.showCallArguments()
            );
        }
    };

    /**
     * Checks if the spy was called with the provided arguments.
     *
     * Throws an error if the expectation is wrong.
     *
     * For example:
     * const spy = new Spy();
     * spy(arg1, arg2, arg3);
     * spy(arg4, arg5);
     * spy.wasCalledWith(arg1, arg2, arg3); // no error
     * spy.wasCalledWith(arg4, arg5); // no error
     * spy.wasCalledWith(arg1); // error!!!
     *
     * @param {Array<any>} args -> The expected arguments
     *                           for any made call.
     */
    Spy.prototype.wasCalledWith = function(...args:Array<any>) {
        const madeCalls = this._calls;
        if (madeCalls.length === 0) {
            throw new Error(`\n\n${this._name} was never called!\n\n`);
        }
        const diffInfo = [];
        for (let i = 0; i < madeCalls.length; i++) {
            const diff =
                differenceOf(madeCalls[i].arguments, args, this._config);
            if (!diff) {
                return;
            }
            diffInfo.push(diff);
        }
        throw new Error(
            `\n\nFor ${this._name} did not find call arguments:\n\n` +
            `    --> ${JSON.stringify(args)}\n\n` +
            'Actually there were:\n\n' + this.showCallArguments(diffInfo)
        );
    };

    /**
     * Checks if the spy was NOT called with the provided arguments.
     * This method checks the direct opposite of the method
     * Spy.prototype.wasCalledWith.
     *
     * It throws an error if the upper method would not.
     *
     * For example:
     * const spy = new Spy();
     * spy(arg1, arg2, arg3);
     * spy(arg4, arg5);
     * spy.wasCalledWith(arg1); // no error
     * spy.wasCalledWith(arg4, arg3); // no error
     * spy.wasCalledWith(arg4, arg5); // error!!!
     *
     * @param {Array<any>} args -> The not expected arguments
     *                             for any made call.
     */
    Spy.prototype.wasNotCalledWith = function(...args:Array<any>) {
        let errorOccurred = false;
        try {
            this.wasCalledWith(...args);
        } catch (e) {
            errorOccurred = true;
        }
        if (!errorOccurred) {
            throw new Error(
                `\n\nFor ${this._name} did find call arguments:\n\n` +
                `    --> ${JSON.stringify(args)}\n\n` +
                'Actually they were not expected!\n\n'
            );
        }
    };

    /**
     * This method returns the call arguments of the
     * n'th made call as array. If less than n calls were made,
     * it will throw an error.
     *
     * By default n = 1. This corresponds to callNr = 0.
     *
     * For example:
     * const spy = new Spy();
     * spy(arg1, arg2, arg3);
     * spy.getCallArguments(); // returns [arg1, arg2, arg3]
     *
     * @param {number} callNr -> represents the callNr for which
     *                           the call argument should be returned.
     *
     * @return {Array<any>} -> the call arguments of the (callNr + 1)'th call.
     */
    Spy.prototype.getCallArguments = function(callNr:number = 0):Array<any> {
        const madeCalls = this._calls;
        if (callNr % 1 !== 0 || callNr >= madeCalls.length) {
            throw new Error(
                `\n\nThe provided callNr "${callNr}" was not valid.\n\n` +
                `Made calls for ${this._name}:\n\n` +
                this.showCallArguments()
            );
        }
        return madeCalls[callNr].arguments;
    };

    /**
     * This method returns the first call argument of the
     * n'th made call. If less than n calls were made, it will throw
     * an error.
     *
     * By default n = 1. This corresponds to callNr = 0.
     *
     * For example:
     * const spy = new Spy();
     * spy(arg1, arg2, arg3);
     * spy.getFirstCallArgument() === arg1; // true
     *
     * @param {number} callNr -> represents the callNr for which
     *                           the first call argument should be returned.
     *
     * @return {any} -> the first call argument of the (callNr + 1)'th call.
     */
    Spy.prototype.getFirstCallArgument = function(callNr:number = 0):any {
        return this.getCallArguments(callNr)[0];
    };

    /**
     * This method returns a formatted text string for debugging
     * made calls with the given Spy. It is used also internally
     * if some wrong assertions were made on the Spy.
     * Some sample:
     *
     * call 0: [{"_key":"test1"}]
     * call 1: [{"_key":"test1"},{"_key":"test2"}]
     * call 2: [{"_key":"test3"},{"_key":"test2"},{"_key":"test1"}]
     * call 3: [{"_key":"test2"}]
     *
     * If an array of strings is provided, the given strings will
     * be printed just below params of each call.
     *
     * Some sample: additionalInformation = [
     *     '-> 0 / _key / different string',
     *     '-> 1 / _key / different object types'
     * ]
     *
     * call 0: [{"_key":"test1"}]
     *         -> 0 / _key / different string
     * call 1: [{"_key":"test1"},{"_key":"test2"}]
     *         -> 1 / _key / different object types
     * call 2: [{"_key":"test3"},{"_key":"test2"},{"_key":"test1"}]
     * call 3: [{"_key":"test2"}]
     *
     * @param {Array<string>} additionalInformation
     *      -> will be displayed below each call information
     *         as additional information.
     *
     * @return {string} -> The information about made calls.
     */
    Spy.prototype.showCallArguments = function(
        additionalInformation:Array<string> = []
    ):string {
        const madeCalls = this._calls;
        if (madeCalls.length === 0) {
            return `${this._name} was never called!\n`;
        }
        let response = '';
        for (let i = 0; i < madeCalls.length; i++) {
            response +=
                `call ${i}: ${JSON.stringify(madeCalls[i].arguments)}\n`;
            if (additionalInformation[i]) {
                response += `        ${additionalInformation[i]}\n`;
            }
        }
        return response;
    };

    return Spy;
})();

export {Spy};
