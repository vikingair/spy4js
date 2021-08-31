/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */

// returns a spy instance
type SpyOn = (obj: Object, method: keyof typeof obj) => any;

const uninitialized = (method: keyof any) => () => {
    throw new Error(`Method '${String(method)}' was not initialized on Mock.`);
};

type MockInfo = { mock: Object; mocked: Object; scope: string; returns?: any };
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

const registerMock = (mocked: Object, returns?: any) => {
    const mock = {};
    _mocks[scope].push({ mocked, mock, scope, returns });
    return mock;
};

export const createMock = <T, K extends keyof T>(obj: T, methods: K[], returns?: any): { [P in K]: any } => {
    const mock = registerMock(obj, returns) as { [P in K]: any };
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

const initMock = ({ mocked, mock, scope, returns }: MockInfo, spyOn: SpyOn): void => {
    Object.keys(mock).forEach((method) => {
        try {
            mock[method as keyof typeof mock] = spyOn(mocked, method as keyof typeof mock).returns(returns);
        } catch (e) {
            throw couldNotInitError(scope, (e as Error).message);
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
