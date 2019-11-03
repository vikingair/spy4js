/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { Serializer } from 'serialize-as-code';

/**
 * This symbol serves as replacement to ignore any
 * inequality and skip further comparisons.
 */
export const IGNORE = Symbol.for('__Spy_IGNORE__');

export const serialize = Serializer.create(
    o => (o === IGNORE && '>IGNORED<') || undefined
);
