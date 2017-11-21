'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Spy = undefined;

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _utils = require('./utils');

var _registry = require('./registry');

var _serializer = require('./serializer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * Instantiating the SpyRegistry to handle all
 * mocked object relative information and
 * restore their functionality if requested.
 *
 */
var registry = new _registry.SpyRegistry();

var __LOCK__ = true;

/**
 * Those symbols are used to protect the private spy properties from outer manipulation by mistake.
 */
var Symbols = {
    name: (0, _symbol2.default)('__Spy_name__'),
    isSpy: (0, _symbol2.default)('__Spy_isSpy__'),
    func: (0, _symbol2.default)('__Spy_func__'),
    calls: (0, _symbol2.default)('__Spy_calls__'),
    config: (0, _symbol2.default)('__Spy_config__'),
    index: (0, _symbol2.default)('__Spy_config__')
};

/**
 * Initial default settings for every
 * spy instance. Can be modified only
 * implicitly by "Spy.configure".
 *
 * @type {{useOwnEquals: boolean}}
 */
var DefaultSettings = {
    useOwnEquals: true
};

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
 * @private
 * @param {string} __mock -> DO NOT USE.
 *
 * @constructor
 */
function Spy() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'the spy';
    var __mock = arguments[1];

    if (!(this instanceof Spy)) {
        throw new Error('\n\nPlease make sure to use this constructor only with "new" keyword.\n\n');
    }
    var spy = function spy() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        spy[Symbols.calls].push({ arguments: args });
        return spy[Symbols.func].apply(spy, args);
    };
    if (__mock && !__LOCK__) {
        spy[Symbols.index] = registry.push(__mock.obj, __mock.methodName);
    } else {
        spy[Symbols.index] = null;
    }
    spy[Symbols.name] = name;
    spy[Symbols.isSpy] = true;
    spy[Symbols.func] = function () {};
    spy[Symbols.calls] = [];
    spy[Symbols.config] = { useOwnEquals: DefaultSettings.useOwnEquals };
    (0, _utils.forEach)(Spy.prototype, function (key, value) {
        spy[key] = value;
    });
    return spy;
}

/**
 * This static method can be used to configure
 * the default behaviour of created spy instances.
 *
 * For example,
 *
 * Spy.configure({useOwnEquals: false});
 *
 * would initially configure every spy to not
 * favor own "equals" implementation while
 * comparing any objects.
 *
 * @param {Object} config <- Holds the configuration params.
 */
Spy.configure = function configure(config) {
    if (config.useOwnEquals !== undefined) {
        DefaultSettings.useOwnEquals = config.useOwnEquals;
    }
};

/**
 * This static attribute can be used to ignore the match
 * of a specific argument when using "wasCalledWith".
 */
Spy.IGNORE = _utils.IGNORE;

/**
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
Spy.on = function on(obj, methodName) {
    var method = obj[methodName];
    if (!(method instanceof Function)) {
        throw new Error('The object attribute \'' + methodName + '\' ' + ('was: ' + (0, _serializer.serialize)(method) + '\n\n') + 'You should only spy on functions!');
    }
    if (method[Symbols.isSpy]) {
        throw new Error('The objects attribute \'' + methodName + '\'' + ' was already spied. Please make sure to spy' + ' only once at a time at any attribute.');
    }
    __LOCK__ = false;
    var spy = new Spy('the spy on \'' + methodName + '\'', { obj: obj, methodName: methodName });
    __LOCK__ = true;
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
Spy.onMany = function onMany(obj) {
    var spies = [];

    for (var _len2 = arguments.length, methodNames = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        methodNames[_key2 - 1] = arguments[_key2];
    }

    for (var i = 0; i < methodNames.length; i++) {
        var spy = Spy.on(obj, methodNames[i]);
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
Spy.restoreAll = function restoreAll() {
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
 * - persistent:boolean -> toggles the persistence of the spy.
 *                         I.e. making it restorable or not.
 *                         Throws for not mocking spies.
 *
 * @param {Object} config <- An object containing attributes
 *                         for special configuration
 * @return {Spy} <- BuilderPattern.
 */
Spy.prototype.configure = function (config) {
    if (config.useOwnEquals !== undefined) {
        this[Symbols.config].useOwnEquals = config.useOwnEquals;
    }
    if (config.persistent !== undefined) {
        if (!this[Symbols.index]) {
            throw new Error('\n\n' + this[Symbols.name] + ' can not' + ' be configured to be persistent!' + ' It does not mock any object.');
        }
        this[Symbols.config].persistent = config.persistent;
        registry.persist(this[Symbols.index], this[Symbols.config].persistent);
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
Spy.prototype.calls = function () {
    for (var _len3 = arguments.length, funcs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        funcs[_key3] = arguments[_key3];
    }

    if (funcs.length === 0) {
        // no arguments provided
        this[Symbols.func] = function () {};
        return this;
    }

    var max = funcs.length - 1;
    var counter = -1;

    this[Symbols.func] = function () {
        counter++;
        return funcs[max < counter ? max : counter].apply(funcs, arguments);
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
Spy.prototype.returns = function () {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
    }

    var funcs = [];

    var _loop = function _loop(i) {
        funcs.push(function () {
            return args[i];
        });
    };

    for (var i = 0; i < args.length; i++) {
        _loop(i);
    }

    return this.calls.apply(this, funcs);
};

/**
 * Will make the spy throw an Error, if called next time.
 * The error message can be provided as parameter.
 *
 * @param {?string} message -> Will be the error message.
 *
 * @return {Spy} <- BuilderPattern
 */
Spy.prototype.throws = function (message) {
    var _this = this;

    this[Symbols.func] = function () {
        throw new Error(message || _this[Symbols.name] + ' was requested to throw');
    };
    return this;
};

/**
 * Deletes all notices of made calls with this spy.
 *
 * @return {Spy} <- BuilderPattern
 */
Spy.prototype.reset = function () {
    this[Symbols.calls] = [];
    return this;
};

/**
 * Restores the last by this spy manipulated object
 * and removes this special mock.
 *
 * Restoring objects does not disable any
 * other behaviours/features of the spies.
 *
 * If the spy was configured persistent, than this
 * method will throw an exception.
 *
 * Other than "Spy.restoreAll" this method only removes
 * a maximum of one mock.
 *
 * @return {Spy} <- BuilderPattern
 */
Spy.prototype.restore = function () {
    if (this[Symbols.config].persistent) {
        throw new Error('\n\n' + this[Symbols.name] + ' can not be restored!' + ' It was configured to be persistent.');
    }
    registry.restore(this[Symbols.index]);
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
Spy.prototype.transparent = function () {
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
Spy.prototype.transparentAfter = function (callCount) {
    var _this2 = this;

    var oldFunc = this[Symbols.func];
    this[Symbols.func] = function () {
        // before the function call is executed,
        // the call arguments were already saved
        // -> so we are interested if the made calls
        //    are more than the call count were we
        //    need to modify the behavior
        if (_this2[Symbols.calls].length > callCount) {
            var originalMethod = registry.getOriginalMethod(_this2[Symbols.index]);
            if (originalMethod) {
                return originalMethod.apply(undefined, arguments);
            }
            return;
        }
        return oldFunc.apply(undefined, arguments);
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
Spy.prototype.wasCalled = function () {
    var callCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var madeCalls = this[Symbols.calls].length;
    if (callCount) {
        if (madeCalls !== callCount) {
            throw new Error('\n\n' + this[Symbols.name] + ' was called ' + madeCalls + ' times,' + (' but there were expected ' + callCount + ' calls.\n\n'));
        }
    } else if (madeCalls === 0) {
        throw new Error('\n\n' + this[Symbols.name] + ' was never called!\n\n');
    }
};

/**
 * Checks that the spy was never called.
 * Throws an error if the spy was called at least once.
 */
Spy.prototype.wasNotCalled = function () {
    var madeCalls = this[Symbols.calls];
    if (madeCalls.length !== 0) {
        throw new Error('\n\n' + this[Symbols.name] + ' was not' + ' considered to be called.\n\n' + 'Actually there were:\n\n' + this.showCallArguments());
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
Spy.prototype.wasCalledWith = function () {
    var madeCalls = this[Symbols.calls];
    if (madeCalls.length === 0) {
        throw new Error('\n\n' + this[Symbols.name] + ' was never called!\n\n');
    }
    var diffInfo = [];

    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
    }

    for (var i = 0; i < madeCalls.length; i++) {
        var diff = (0, _utils.differenceOf)(madeCalls[i].arguments, args, this[Symbols.config]);
        if (!diff) {
            return;
        }
        diffInfo.push(diff);
    }
    throw new Error('\n\n' + this[Symbols.name] + ' was considered' + ' to be called with the following arguments:\n\n' + ('    --> ' + (0, _serializer.serialize)(args) + '\n\n') + 'Actually there were:\n\n' + this.showCallArguments(diffInfo));
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
Spy.prototype.wasNotCalledWith = function () {
    var errorOccurred = false;

    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
    }

    try {
        this.wasCalledWith.apply(this, args);
    } catch (e) {
        errorOccurred = true;
    }
    if (!errorOccurred) {
        throw new Error('\n\n' + this[Symbols.name] + ' was called' + ' unexpectedly with the following arguments:\n\n' + ('    --> ' + (0, _serializer.serialize)(args) + '\n\n'));
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
Spy.prototype.getCallArguments = function () {
    var callNr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var madeCalls = this[Symbols.calls];
    if (callNr % 1 !== 0 || callNr >= madeCalls.length) {
        throw new Error('\n\nThe provided callNr "' + callNr + '" was not valid.\n\n' + ('Made calls for ' + this[Symbols.name] + ':\n\n') + this.showCallArguments());
    }
    return madeCalls[callNr].arguments;
};

/**
 * This method returns the m'th call argument of the
 * n'th made call. If less than n calls were made, it will throw
 * an error.
 *
 * By default n = 1. This corresponds to callNr = 0.
 * By default m = 1. This corresponds to argNr = 0.
 *
 * For example:
 * const spy = new Spy();
 * spy(arg1, arg2, arg3);
 * spy(arg4, arg5, arg6);
 * spy.getCallArgument() === arg1; // true
 * spy.getCallArgument(1) === arg4; // true
 * spy.getCallArgument(0, 2) === arg3; // true
 * spy.getCallArgument(1, 1) === arg5; // true
 *
 * spy.getCallArgument(1, 5) === undefined; // true
 * spy.getCallArgument(2); // throws an exception
 *
 * @param {number} callNr -> represents the callNr for which
 *                           a call argument should be returned.
 * @param {number} argNr -> represents position of the argument
 *                          when the corresponding call was made.
 *
 * @return {any} -> the (argNr + 1)'th call argument
 *                  of the (callNr + 1)'th call.
 */
Spy.prototype.getCallArgument = function () {
    var callNr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var argNr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    return this.getCallArguments(callNr)[argNr];
};

/**
 * This method returns the number of made calls on the spy.
 *
 * @return {number} -> the number of made calls.
 */
Spy.prototype.getCallCount = function () {
    return this[Symbols.calls].length;
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
Spy.prototype.showCallArguments = function () {
    var additionalInformation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var madeCalls = this[Symbols.calls];
    if (madeCalls.length === 0) {
        return this[Symbols.name] + ' was never called!\n';
    }
    var response = '';
    for (var i = 0; i < madeCalls.length; i++) {
        var _args = (0, _serializer.serialize)(madeCalls[i].arguments);
        response += 'call ' + i + ': ' + _args + '\n';
        if (additionalInformation[i]) {
            response += '        ' + additionalInformation[i] + '\n';
        }
    }
    return response;
};

exports.Spy = Spy;