/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */

import { createMock } from './mock';
import { SpyInstance } from './spy';
import { Config } from './config';

// 'path' and 'fs' have to be lazy loaded because we first need to validate
// if the CommonJS context is used by the test runner.
const pathDirname = (p: string) => require('path').dirname(p);
const pathJoin = (...p: string[]) => require('path').join(...p);
const fsExistsSync = (p: string) => require('fs').existsSync(p);

//
// const oldDescribe = describe;
//
// const newDescribe: jest.Describe = (name, suite) => {
//     oldDescribe(name, () => {
//         const scoping = String(name);
//         setScope(scoping);
//         beforeEach(() => {
//             runner.beforeEach && runner.beforeEach(scoping);
//         });
//         afterEach(() => {
//             runner.afterEach && runner.afterEach(scoping);
//         });
//         const rv = suite();
//         setScope(undefined);
//         return rv;
//     });
// };
// newDescribe.each = oldDescribe.each;
// newDescribe.only = oldDescribe.only;
// newDescribe.skip = oldDescribe.skip;
// // eslint-disable-next-line no-global-assign
// describe = newDescribe;

// const addSnapshotSerializer = (serializer: any) => {
//     Env.isJest && expect && expect.addSnapshotSerializer && expect.addSnapshotSerializer(serializer);
// };

// 1. Spy.createMock in some test
// 2. _createMock from test-suite.js
// 3. __getAbsolutePath or __getNodeModulePath from test-suite.js
// 4. __callerBasedir from test-suite.js
// 5. __caller from test-suite.js
const STACK_NUM_CREATE_MOCK = 5;

const __caller = () => {
    const traceFn = Error.prepareStackTrace;
    Error.prepareStackTrace = (_error, stack) => stack;
    const stack = new Error().stack as any;
    Error.prepareStackTrace = traceFn;
    // it highly depends from were the functionality will be called
    return stack[STACK_NUM_CREATE_MOCK].getFileName();
};

const __callerBasedir = () => pathDirname(__caller());

const __getAbsolutePath = (moduleName: string) => pathJoin(__callerBasedir(), moduleName);

const __getDepDir = (moduleName: string, file: string) => (moduleName.includes('/') ? pathDirname(file) : file);

// We cannot just use "require(moduleName)" because we need to derive the correct
// "node_modules" to use for the caller.
// E.g. if "spy4js" is installed globally or in a workspace root while
//      the caller wants to mock a module contained several levels deeper in
//      the file tree, we need to determine the correct dependency like the Node
//      implementation of "require" does.
// Behavior: From the caller base dir iterate the file tree up until the desired
//           module was found in some "node_modules" directory. Fail if the
//           module could not be found in the parent hierarchy.
const __getNodeModulePath = (moduleName: string) => {
    let baseDir = __callerBasedir();
    const calcFile = () => pathJoin(baseDir, 'node_modules', moduleName);
    let file = calcFile();
    while (!fsExistsSync(__getDepDir(moduleName, file))) {
        if (baseDir === '/') {
            throw new Error(`spy4js: Could not find given module: "${moduleName}"`);
        }
        baseDir = pathJoin(baseDir, '..');
        file = calcFile();
    }
    return file;
};

const createModuleMock = <K extends string>(
    moduleName: string,
    names: K[],
    callsFactory?: (methodName: string) => (...args: any[]) => any
): { [P in K]: SpyInstance } => {
    if (!Config.isCJS)
        throw new Error('spy4js: Mocking a module only works if your test runner executes with CommonJS');

    const isNodeModule = moduleName.indexOf('.') !== 0 && moduleName.indexOf('/') !== 0;
    const modulePath = isNodeModule ? __getNodeModulePath(moduleName) : __getAbsolutePath(moduleName);

    // now we are free to use "require('path')" to calculate the correct
    // module path for the mocking.
    return createMock(require(modulePath), names, callsFactory, moduleName);
};

export const TestSuite = { createModuleMock };
