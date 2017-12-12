/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { IGNORE, objectKeys } from './utils';

const __serialize = (o: any, alreadySerialized: Array<any> = []): string => {
    if (o === IGNORE) {
        return '>IGNORED<';
    }
    if (o === undefined) {
        return 'undefined';
    }
    if (o === null) {
        return 'null';
    }
    const oClass = Object.prototype.toString.call(o);
    switch (oClass) {
        case '[object RegExp]':
            return `/${String(o)}/`;
        case '[object String]':
            return `"${o}"`;
        case '[object Function]':
            return 'Function';
        case '[object Date]':
            return `>Date:${Number(o)}<`;
        case '[object Number]':
        case '[object Boolean]':
        case '[object Symbol]':
            return String(o);
        default:
        // nothing
    }
    if (alreadySerialized.indexOf(o) !== -1) {
        return '>CYCLOMATIC<';
    }
    const serialized = [...alreadySerialized, o];
    if (oClass === '[object Array]') {
        const results = [];
        for (let i = 0; i < o.length; i++) {
            results.push(__serialize(o[i], serialized));
        }
        return `[${results.join(', ')}]`;
    }

    const oKeys = objectKeys(o);
    const results = [];
    for (let i = 0; i < oKeys.length; i++) {
        const key = oKeys[i];
        results.push(`${key}: ${__serialize(o[key], serialized)}`);
    }
    const objectType = o.constructor.name;
    const displayedType = objectType === 'Object' ? '' : objectType;
    return `${displayedType}{${results.join(', ')}}`;
};

export const serialize = (o: any): string => {
    return __serialize(o);
};
