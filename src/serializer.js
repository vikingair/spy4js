/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { IGNORE } from './utils';
import { Serializer } from 'serialize-as-code';

export const serialize = Serializer.create(
    o => (o === IGNORE && '>IGNORED<') || undefined
);
