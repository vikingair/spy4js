'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IGNORE = exports.objectKeys = exports.forEach = exports.differenceOf = undefined;

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This function takes a handler as second argument to process
 * all key-value-pairs of the given object through this handler.
 *
 * For example:
 *
 * forEach({attr1: 'str1', attr2: 123}, (k, v) => {
 *      console.log(k + 'has value: ' + v);
 * });
 *
 * @param {Array<any>|Object} arrOrObj <- Array or Object to iterate.
 *                                      (Flow does not want to iterate
 *                                      over arrays with for-in, so we
 *                                      have to write here any.)
 * @param {Function} handler <- Handler function to process all values.
 *
 */
var forEach = function forEach(arrOrObj, handler) {
    for (var _key in arrOrObj) {
        if (arrOrObj.hasOwnProperty(_key)) {
            handler(_key, arrOrObj[_key]);
        }
    }
};

/**
 * This function returns all own keys for the given
 * object or array as array.
 *
 * For example:
 *
 * objectKeys({attr1: 'something', attr2: 123, attr3: {deepAttr: 42}})
 *     === ['attr1', 'attr2', 'attr3']
 *
 * objectKeys(['something', 123, {attr: 42}]) === ['0', '1', '2']
 *
 * @param {Array<any>|Object} arrOrObj <- Array or Object to iterate.
 *                                      (Flow does not want to iterate
 *                                      over arrays with for-in, so we
 *                                      have to write here any.
 * @return {Array} <- containing all keys for the input object.
 */
var objectKeys = function objectKeys(arrOrObj) {
    var keys = [];
    forEach(arrOrObj, function (key) {
        return keys.push(key);
    });
    return keys;
};

var mergeArrays = function mergeArrays(arr1, arr2) {
    var result = [].concat((0, _toConsumableArray3.default)(arr1));
    forEach(arr2, function (key, val) {
        if (arr1.indexOf(val) === -1) {
            result.push(val);
        }
    });
    return result;
};

/**
 * This symbol serves as replacement to ignore any
 * inequality and skip further comparisons.
 */
var IGNORE = (0, _symbol2.default)('__Spy_IGNORE__');

/**
 * This function is the internal representation of
 * "differenceOf". It does recursively call itself.
 * Read more below.
 *
 * @param {any} a <- any param.
 * @param {any} b <- any param to compare with the first param.
 * @param {boolean} initial <- is responsible for result
 *                             string building for deep equal checks.
 * @param {boolean} useOwnEquals <-  enables/disables the usage
 *                                   of own "equals" implementations.
 * @param {Array<any>} alreadyComparedArray
 *      <- All flatly compared objects
 *         will be temporarily stored
 *         in this array to resolve
 *         circular structures.
 *
 * @return {string|void} <- information about the difference
 *                           of the provided arguments.
 */
var __diff = function __diff(a, b, initial, useOwnEquals) {
    var alreadyComparedArray = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

    if (a === IGNORE || b === IGNORE) {
        return;
    }
    if (a === b) {
        return;
    }
    if (a === undefined || b === undefined) {
        return 'one was undefined';
    }
    if (a === null || b === null) {
        return 'one was null';
    }
    var aClass = Object.prototype.toString.call(a);
    var bClass = Object.prototype.toString.call(b);
    if (aClass !== bClass) {
        return 'different object types: ' + aClass + ' <-> ' + bClass;
    }
    switch (aClass) {
        case '[object RegExp]':
            if (String(a) === String(b)) {
                return;
            }
            return 'different regexp';
        case '[object String]':
            return 'different string';
        case '[object Function]':
            return 'different function';
        case '[object Number]':
            if (isNaN(a) && isNaN(b)) {
                return;
            }
            return 'different number';
        case '[object Date]':
            if (Number(a) === Number(b)) {
                return;
            }
            return 'different date';
        case '[object Boolean]':
            return 'different bool';
        default:
            if (a.constructor !== b.constructor) {
                return 'different constructor';
            }
    }
    if (useOwnEquals && a.equals instanceof Function) {
        if (a.equals(b)) {
            return;
        }
        return 'own equals method failed <- ' + 'Maybe you want to disable the usage ' + 'of own equals implementation? ' + '[ Use: spy.configure({useOwnEquals: false}) ]';
    }
    if (alreadyComparedArray.indexOf(a) !== -1) {
        return;
    }
    var compared = [].concat((0, _toConsumableArray3.default)(alreadyComparedArray), [a]);
    var keys = mergeArrays(objectKeys(a), objectKeys(b));
    for (var i = 0; i < keys.length; i++) {
        var _key2 = keys[i];
        var diffStr = __diff(a[_key2], b[_key2], false, useOwnEquals, compared);
        if (diffStr !== undefined) {
            return (initial ? '--> ' + _key2 : '' + _key2) + ' / ' + diffStr;
        }
    }
};

/**
 * This function does make a comparison of two provided params.
 *
 * If found any difference it will return a string containing
 * information about the first detected difference.
 *
 * If the given params were proven "identical" this function
 * returns undefined.
 *
 * In first place the params are flatly checked. The checks are
 * in the following order:
 *
 * - identical objects
 * - one param is null or undefined
 * - object type
 * - regexp/string/number/date/boolean
 * - constructor
 * - keys length
 * - own "equals" implementation
 *
 * In second place all keys of the params are deeply checked.
 * Using the above flat checks for all attributes.
 *
 * Also all circular structures will be resolved and repeating
 * attributes will be assumed to be equal.
 *
 * @param {any} a <- any param.
 * @param {any} b <- any param to compare with the first param.
 * @param {{useOwnEquals:boolean}} config <- controls the usage of own
 *                                           "equals" implementations.
 *
 * @return {string|void} <- information about the difference
 *                           of the provided arguments.
 */
var differenceOf = function differenceOf(a, b) {
    var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { useOwnEquals: true };

    return __diff(a, b, true, config.useOwnEquals);
};

exports.differenceOf = differenceOf;
exports.forEach = forEach;
exports.objectKeys = objectKeys;
exports.IGNORE = IGNORE;