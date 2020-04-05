/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { setScope, createMock } from './mock';

// we have to cheat here flow since it might be the case that "jest" was not
// configured correctly or the jest test runner might not even be present
// $FlowFixMe
export const _testSuite = { isJest: !!(jest: any), isCJS: !!(require: any) };

type Scope = string;
type Runner = { afterEach?: (Scope) => void, beforeEach?: (Scope) => void };
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

const configure = (other: Runner): void => {
    if (other.afterEach) runner.afterEach = other.afterEach;
    if (other.beforeEach) runner.beforeEach = other.beforeEach;
};

const addSnapshotSerializer = (serializer: any) => {
    _testSuite.isJest &&
        (expect: any) &&
        (expect: any).addSnapshotSerializer &&
        (expect: any).addSnapshotSerializer(serializer);
};

const __caller = (stackNum: number) => {
    const traceFn = Error.prepareStackTrace;
    Error.prepareStackTrace = (err, stack) => stack;
    const stack = new Error().stack;
    Error.prepareStackTrace = traceFn;
    // it highly depends from were the functionality will be called
    return (stack[stackNum]: any).getFileName();
};

const __callerBasedir = (stackNum: number) =>
    require('path').dirname(__caller(stackNum));

const __getAbsolutePath = (stackNum: number, moduleName: string) =>
    require('path').join(__callerBasedir(stackNum), moduleName);

// 1. Spy.createMock in some test
// 2. _createMock from test-suite.js
// 3. __getAbsolutePath from test-suite.js
// 4. __callerBasedir from test-suite.js
// 5. __caller from test-suite.js
const STACK_NUM_CREATE_MOCK = 5;
const createModuleMock = (
    moduleName: string,
    names: string[],
    returns?: any
): Object => {
    if (!_testSuite.isCJS)
        throw new Error(
            'Spy.moduleMock works only if your test runner executes with CommonJS'
        );

    const isNodeModule =
        moduleName.indexOf('.') !== 0 && moduleName.indexOf('/') !== 0;

    // now we are free to use "require('path')" to calculate the correct
    // module path for the mocking.
    return createMock(
        require(isNodeModule
            ? moduleName
            : __getAbsolutePath(STACK_NUM_CREATE_MOCK, moduleName)),
        names,
        returns
    );
};

export const TestSuite = { addSnapshotSerializer, createModuleMock, configure };
