/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { forEach } from './utils';

type SpyOn = (Object, string) => Function;

const uninitialized = (method: string) => () => {
    throw new Error(`Method '${method}' was not initialized on Mock.`);
};

type MockInfo = { mock: Object, mocked: Object, scope: string };
type MockScope = MockInfo[];
export const defaultScope: string = (Symbol('__Spy_global__'): any);
export const _mocks: { [string]: MockScope } = { [defaultScope]: [] };

let scope = defaultScope;
export const setScope = (scoping?: string): void => {
    if (scoping) {
        _mocks[scoping] = [];
        scope = scoping;
    } else scope = defaultScope;
};

const registerMock = (mocked: Object, mock: Object = {}): Object => {
    _mocks[scope].push({ mocked, mock, scope });
    return mock;
};

export const createMock = (obj: Object, methods: string[]): Object => {
    const mock = registerMock(obj);
    forEach(methods, (_, method: string) => {
        mock[method] = uninitialized(method);
    });
    return mock;
};

const couldNotInitError = (scope: string, additional: string) =>
    new Error(
        `Could not initialize mock for ${
            scope === defaultScope ? 'global scope' : `scope "${scope}"`
        }, because:\n${additional}`
    );

const initMock = ({ mocked, mock, scope }: MockInfo, spyOn: SpyOn): void => {
    forEach(mock, (method: string) => {
        try {
            mock[method] = spyOn(mocked, method);
        } catch (e) {
            throw new couldNotInitError(scope, e.message);
        }
    });
};

const initMockScope = (scoping: string, spyOn: SpyOn): void => {
    forEach(_mocks[scoping], (_, mock: MockInfo) => initMock(mock, spyOn));
};

export const initMocks = (spyOn: SpyOn, scoping?: string): void => {
    initMockScope(defaultScope, spyOn);
    scoping && initMockScope(scoping, spyOn);
};
