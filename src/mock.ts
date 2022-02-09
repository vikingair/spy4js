/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */
import { Env } from './env';

// returns a spy instance
type SpyOn = (obj: Object, method: keyof typeof obj) => any;

const uninitialized = (method: keyof any) => () => {
    throw new Error(`Method '${String(method)}' was not initialized on Mock.`);
};

type MockInfo = {
    mock: Object;
    mocked: Object;
    scope: string;
    callsFactory?: (methodName: string) => (...args: any[]) => any;
    moduleName?: string;
};
type MockScope = MockInfo[];

export const defaultScope: string = Symbol('__Spy_global__') as any;
export const _mocks: { [scoping: string]: MockScope } = { [defaultScope]: [] };

let scope = defaultScope;
export const setScope = (scoping?: string): void => {
    if (scoping) {
        _mocks[scoping] = [];
        scope = scoping;
    } else scope = defaultScope;
};

const registerMock = (mocked: Object, callsFactory?: MockInfo['callsFactory'], moduleName?: string) => {
    const mock = {};
    _mocks[scope].push({ mocked, mock, scope, callsFactory, moduleName });
    return mock;
};

export const createMock = <T, K extends keyof T>(
    obj: T,
    methods: K[],
    callsFactory?: MockInfo['callsFactory'],
    moduleName?: string
): { [P in K]: any } => {
    const mock = registerMock(obj, callsFactory, moduleName) as { [P in K]: any };
    methods.forEach((method) => {
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

const initMock = ({ mocked, mock, scope, callsFactory, moduleName }: MockInfo, spyOn: SpyOn): void => {
    Object.keys(mock).forEach((method) => {
        try {
            const spy = spyOn(mocked, method as keyof typeof mock);
            if (callsFactory) spy.calls(callsFactory(method));
            mock[method as keyof typeof mock] = spy;
        } catch (e) {
            let msg = (e as Error).message;
            if (Env.isJest && msg.includes('has only a getter')) {
                msg += `
Inserting a jest module mock might resolve this problem. Put this outside of the "describe":

jest.mock('${moduleName}');

Or if you don't want to mock everything from this module, you can use this:

jest.mock('${moduleName}', () => ({
    ...jest.requireActual('${moduleName}'),
    '${method}': () => {},
}));`;
            }
            throw couldNotInitError(scope, msg);
        }
    });
};

const initMockScope = (scoping: string, spyOn: SpyOn): void => {
    Object.values(_mocks[scoping]).forEach((mock) => initMock(mock, spyOn));
};

export const initMocks = (spyOn: SpyOn, scoping?: string): void => {
    initMockScope(defaultScope, spyOn);
    scoping && initMockScope(scoping, spyOn);
};
