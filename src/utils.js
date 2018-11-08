/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

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
const forEach = (
    arrOrObj: any,
    handler: (key: string, value: any) => any
): void => {
    for (let key in arrOrObj) {
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
const objectKeys = (arrOrObj: any): Array<string> => {
    const keys = [];
    forEach(arrOrObj, (key: string) => keys.push(key));
    return keys;
};

const mergeArrays = (arr1: Array<any>, arr2: Array<any>): Array<any> => {
    const result = [...arr1];
    forEach(arr2, (key, val) => {
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
const IGNORE = Symbol.for('__Spy_IGNORE__');

type Comparator = (arg: any) => boolean;
/**
 * Uniquely identifiable container for spy relevant comparators.
 */
class SpyComparator {
    _func: Comparator;
    constructor(comparator: Comparator) {
        this._func = comparator;
    }
    compare(arg: any): string | void {
        if (!this._func(arg)) return 'custom comparison failed';
    }
}
/**
 * This function may create individual comparators
 * to define argument based comparison for arbitrary
 * nested objects.
 */
const COMPARE = (comparator: Comparator): SpyComparator =>
    new SpyComparator(comparator);

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
const __diff = (
    a: any,
    b: any,
    initial: boolean,
    useOwnEquals: boolean,
    alreadyComparedArray: Array<any> = []
): string | void => {
    if (a === IGNORE || b === IGNORE) return;
    if (a instanceof SpyComparator) return a.compare(b);
    if (b instanceof SpyComparator) return b.compare(a);
    if (a === b) return;
    if (a === undefined || b === undefined) return 'one was undefined';
    if (a === null || b === null) return 'one was null';
    const aClass = Object.prototype.toString.call(a);
    const bClass = Object.prototype.toString.call(b);
    if (aClass !== bClass)
        return `different object types: ${aClass} <-> ${bClass}`;
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
        case '[object Symbol]':
            return 'different symbols';
        case '[object Error]':
            if (String(a) === String(b)) {
                return;
            }
            return 'different error';
        default:
            if (a.constructor !== b.constructor) {
                return 'different constructor';
            }
    }
    if (useOwnEquals && a.equals instanceof Function) {
        if (a.equals(b)) {
            return;
        }
        return (
            'own equals method failed <- ' +
            'Maybe you want to disable the usage ' +
            'of own equals implementation? ' +
            '[ Use: spy.configure({useOwnEquals: false}) ]'
        );
    }
    if (alreadyComparedArray.indexOf(a) !== -1) {
        return;
    }
    const compared = [...alreadyComparedArray, a];
    const keys = mergeArrays(objectKeys(a), objectKeys(b));
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const diffStr = __diff(a[key], b[key], false, useOwnEquals, compared);
        if (diffStr !== undefined) {
            return `${initial ? `--> ${key}` : `${key}`} / ${diffStr}`;
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
const differenceOf = (
    a: any,
    b: any,
    config: { useOwnEquals: boolean } = { useOwnEquals: true }
): string | void => {
    return __diff(a, b, true, config.useOwnEquals);
};

export type OptionalMessageOrError = ?string | Error;
const toError = (msgOrError: OptionalMessageOrError, spyName: string) =>
    msgOrError instanceof Error
        ? msgOrError
        : new Error(msgOrError || `${spyName} was requested to throw`);

export { differenceOf, forEach, objectKeys, IGNORE, COMPARE, toError };
