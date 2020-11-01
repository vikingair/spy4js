/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */

import { IGNORE, serialize } from './serializer';

type Comparator = (arg: any) => boolean | void;
type ComparatorOrMapper = (arg: any) => boolean | void | string;
const SPY_COMPARE_FAILED = 'Spy.COMPARE failed';
const SPY_MAPPER_FAILED = 'Spy.MAPPER failed';
/**
 * Uniquely identifiable container for spy relevant comparators.
 */
class SpyComparator {
    _func: ComparatorOrMapper;
    constructor(comparator: ComparatorOrMapper) {
        this._func = comparator;
    }
    compare(arg: any): string[] | undefined {
        const result = this._func(arg);
        if (typeof result === 'string') return [`${SPY_MAPPER_FAILED} [${result}]`];
        if (result === false) return [SPY_COMPARE_FAILED];
    }
}
/**
 * This function may create individual comparators
 * to define argument based comparison for arbitrary
 * nested objects.
 */
const COMPARE = (comparator: Comparator): SpyComparator => new SpyComparator(comparator);

const MAPPER = (from: any | any[], to: any) =>
    new SpyComparator((mapper: Function) => {
        const result = mapper(...(Array.isArray(from) ? from : [from]));
        const diff = differenceOf(result, to);
        return diff ? `${serialize(result)} did not match ${serialize(to)}: ${diff}` : undefined;
    });

const __different = (type: string) => ['different ' + type];

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
): string[] | undefined => {
    if (a === IGNORE || b === IGNORE) return;
    if (a instanceof SpyComparator) return a.compare(b);
    if (b instanceof SpyComparator) return b.compare(a);
    if (a === b) return;
    if (a === undefined || b === undefined) return ['one was undefined'];
    if (a === null || b === null) return ['one was null'];
    const aClass = Object.prototype.toString.call(a);
    const bClass = Object.prototype.toString.call(b);
    if (aClass !== bClass) return __different(`object types: ${aClass} <-> ${bClass}`);
    switch (aClass) {
        case '[object RegExp]':
            if (String(a) === String(b)) {
                return;
            }
            return __different('regexp');
        case '[object String]':
            return __different('string');
        case '[object Function]':
            return __different('function');
        case '[object AsyncFunction]':
            return __different('async function');
        case '[object Number]':
            if (isNaN(a) && isNaN(b)) {
                return;
            }
            return __different('number');
        case '[object BigInt]':
            return __different('BigInt');
        case '[object Date]':
            if (Number(a) === Number(b)) {
                return;
            }
            return __different('date');
        case '[object Boolean]':
            return __different('bool');
        case '[object Symbol]':
            return __different('symbols');
        case '[object Error]':
            if (String(a) === String(b)) {
                return;
            }
            return __different('error');
        default:
            if (a.constructor !== b.constructor) {
                return __different('constructor');
            }
    }
    if (useOwnEquals && a.equals instanceof Function) {
        if (a.equals(b)) {
            return;
        }
        return [
            'own equals method failed <- ' +
                'Maybe you want to disable the usage ' +
                'of own equals implementation? ' +
                '[ Use: spy.configure({useOwnEquals: false}) ]',
        ];
    }
    if (alreadyComparedArray.indexOf(a) !== -1) {
        return;
    }
    const compared = [...alreadyComparedArray, a];
    const keys = new Set(Object.keys(a).concat(Object.keys(b)));
    for (const key of keys) {
        const diff = __diff(a[key], b[key], false, useOwnEquals, compared);
        if (diff !== undefined) {
            return [key, ...diff];
        }
    }
};

const __serializeDifferentProp = (obj: any, diff: string[]): string => {
    // asserting diff.length > 1
    let toSerialize = obj;
    diff.slice(0, -1).forEach((key: string) => {
        toSerialize = toSerialize[key];
    });
    return serialize(toSerialize);
};

const __diffToStr = (diff: string[], info: string = ''): string => {
    if (diff.length === 1) return diff[0];
    return `--> ${diff[0]} / ` + diff.slice(1).join(' / ') + info;
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
): string | undefined => {
    const diff = __diff(a, b, true, config.useOwnEquals);
    if (!diff) return;
    const diffStr = __diffToStr(diff);
    if (diff.length < 2) return diffStr;
    const diffProp1 = __serializeDifferentProp(a, diff);
    const lastPart = diff[diff.length - 1];
    if (lastPart.indexOf(SPY_MAPPER_FAILED) === 0) return diffStr;
    const info =
        lastPart === SPY_COMPARE_FAILED
            ? `called with: ${diffProp1}`
            : `${diffProp1} != ${__serializeDifferentProp(b, diff)}`;
    return `${diffStr} [${info}]`;
};

export type MessageOrError = string | Error;
export type OptionalMessageOrError = MessageOrError | undefined;
const toError = (msgOrError: OptionalMessageOrError, spyName: string) =>
    msgOrError instanceof Error ? msgOrError : new Error(msgOrError || `${spyName} was requested to throw`);

export { differenceOf, COMPARE, toError, MAPPER };
