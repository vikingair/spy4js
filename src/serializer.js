/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { IGNORE, objectKeys, forEach } from './utils';

const __serializeProp = (key: string, value: any): string =>
    typeof value === 'string'
        ? `${key}="${value}"`
        : `${key}={${__serialize(value)}}`;

const __serializeProps = (o: any, key: ?string, ref: any): string => {
    const props = [];
    forEach(o, (k, v) => {
        if (v !== undefined && k !== 'children')
            props.push(__serializeProp(k, v));
    });
    if (key) props.push(__serializeProp('key', key));
    if (ref) props.push(__serializeProp('ref', ref));
    if (!props.length) return '';
    return ' ' + props.join(' ');
};

const __serializeChildren = (o: any): string => {
    const children = o.props.children;
    if (!children) return '';
    if (typeof children === 'string') return children;
    return Array.isArray(children)
        ? children.map(v => __serialize(v)).join('')
        : __serialize(children);
};

const getTypeName = (type: any): string | void => {
    const typeType = Object.prototype.toString.call(type);
    switch (typeType) {
        case '[object Symbol]':
            if (Symbol.keyFor(type) === 'react.fragment') return 'Fragment';
            return;
        case '[object String]':
            return type;
        case '[object Function]':
            return type.name;
        default:
            return;
    }
};

const __serializeReactElement = (o: any): string => {
    const type = getTypeName(o.type) || 'UNKNOWN';
    // the following line would serialize custom react components deep instead of shallow (but its out-commented
    // because usually it is more helpful to see what was provided)
    // if (typeof o.type === 'function') return __serialize(new o.type(o.props).render());
    const children = __serializeChildren(o);
    const firstPart = `<${type}${__serializeProps(o.props, o.key, o.ref)}`;
    const lastPart = children ? `>${children}</${type}>` : ' />';
    return firstPart + lastPart;
};

const __serializeReact = (o: any): string | void => {
    const symbolKey = Symbol.keyFor(o.$$typeof);
    switch (symbolKey) {
        case 'react.element':
            return __serializeReactElement(o);
        default:
            return;
    }
};

const __serializeIfReact = (o: any): string | void => {
    if (Object.prototype.toString.call(o.$$typeof) === '[object Symbol]') {
        const key = Symbol.keyFor(o.$$typeof);
        if (key && key.indexOf('react.') === 0) return __serializeReact(o);
    }
};

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
    // check if its serializable as react jsx
    const react = __serializeIfReact(o);
    if (react) return react; // was serialized successful -> return it

    const oClass = Object.prototype.toString.call(o);
    switch (oClass) {
        case '[object RegExp]':
            return `/${String(o)}/`;
        case '[object String]':
            return `"${o}"`;
        case '[object Function]':
            return o.name || 'Function';
        case '[object Date]':
            return `>Date:${Number(o)}<`;
        case '[object Number]':
        case '[object Boolean]':
        case '[object Symbol]':
        case '[object Error]':
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

export const serialize = (o: any): string => __serialize(o);
