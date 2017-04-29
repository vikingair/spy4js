'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});


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
    for (var key in arrOrObj) {
        if (arrOrObj.hasOwnProperty(key)) {
            handler(key, arrOrObj[key]);
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

    if (a === b) {
        return;
    }
    if (a === undefined || a === null || b === undefined || b === null) {
        return 'null or undefined did not match';
    }
    var aClass = Object.prototype.toString.call(a);
    if (aClass !== Object.prototype.toString.call(b)) {
        return 'different object types';
    }
    switch (aClass) {
        case '[object RegExp]':
            if (String(a) === String(b)) {
                return;
            }
            return 'different regexp';
        case '[object String]':
            return 'different string';
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
    var aKeys = objectKeys(a);
    var bKeys = objectKeys(b);
    if (aKeys.length !== bKeys.length) {
        return 'different key length';
    }
    if (useOwnEquals && a['equals'] instanceof Function) {
        if (a['equals'](b)) {
            return;
        }
        return 'own equals method failed <- ' + 'Maybe you want to disable the usage ' + 'of own equals implementation? ' + '[ Use: spy.configure({useOwnEquals: false}) ]';
    }
    if (alreadyComparedArray.indexOf(a) !== -1) {
        return;
    }
    alreadyComparedArray.push(a);
    for (var i = 0; i < aKeys.length; i++) {
        var key = aKeys[i];
        var diffStr = __diff(a[key], b[key], false, useOwnEquals, alreadyComparedArray);
        if (diffStr !== undefined) {
            return (initial ? '--> ' + key : '' + key) + ' / ' + diffStr;
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