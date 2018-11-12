/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { setScope } from './mock';

type Scope = string;
type Runner = { afterEach?: Scope => void, beforeEach?: Scope => void };
const runner: Runner = {};

const oldDescribe = describe;

// eslint-disable-next-line
describe = (name: string, suite: Function) => {
    oldDescribe(name, () => {
        setScope(name);
        beforeEach(() => {
            runner.beforeEach && runner.beforeEach(name);
        });
        afterEach(() => {
            runner.afterEach && runner.afterEach(name);
        });
        const rv = suite();
        setScope(undefined);
        return rv;
    });
};

export const configureTestSuite = (other: Runner): void => {
    if (other.afterEach) runner.afterEach = other.afterEach;
    if (other.beforeEach) runner.beforeEach = other.beforeEach;
};
