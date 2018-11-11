/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

type Runner = { afterEach?: void => void, beforeEach?: void => void };
const runner: Runner = {};

const oldDescribe = describe;
// eslint-disable-next-line
describe = (string, func) => {
    oldDescribe(string, () => {
        beforeEach(() => {
            runner.beforeEach && runner.beforeEach();
        });
        afterEach(() => {
            runner.afterEach && runner.afterEach();
        });
        return func();
    });
};

export const configureTestSuite = (other: Runner): void => {
    if (other.afterEach) runner.afterEach = other.afterEach;
    if (other.beforeEach) runner.beforeEach = other.beforeEach;
};
