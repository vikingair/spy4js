/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */
import { Symbols } from './symbols';
import { Spy } from './spy';
import { Config } from './config';

export type Mockable = Record<string, any>;

// returns a spy instance
type SpyOn = (obj: Mockable, method: keyof typeof obj) => any;

const uninitialized = (method: keyof any) => () => {
    throw new Error(`Method '${String(method)}' was not initialized on Mock.`);
};

type MockInfo = {
    mock: Mockable;
    mocked: Mockable;
    // scope: string;
    callsFactory?: (methodName: string) => (...args: any[]) => any;
    moduleName?: string;
    active: boolean;
};

const registerMock = (mocked: Mockable, callsFactory?: MockInfo['callsFactory'], moduleName?: string) => {
    const mock = {};
    const { beforeEach, expect } = Config;

    if (!beforeEach || !expect) throw new Error('You need to call Spy.setup() in order to use mocks.');
    const { currentTestName } = expect.getState();
    if (currentTestName) throw new Error('Mocks can only be created outside of tests');

    beforeEach(() => {
        initMock({ mocked, mock, callsFactory, moduleName, active: false }, Spy.on);
    });

    return mock;
};

export const createMock = <T extends Mockable, K extends keyof T>(
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

export const couldNotInitError = (additional: string) => new Error(`Could not initialize mock because:\n${additional}`);

const initMock = (mockInfo: MockInfo, spyOn: SpyOn): void => {
    const { mocked, mock, callsFactory, moduleName, active } = mockInfo;
    Object.keys(mock).forEach((method) => {
        if (active) return;
        try {
            const spy = spyOn(mocked, method as keyof typeof mock);
            mockInfo.active = true;
            if (callsFactory) {
                spy.calls(callsFactory(method));
                spy.displayName = method; // TODO: test if name works, too
            }
            spy[Symbols.onRestore] = () => {
                mockInfo.active = false;
            };
            mock[method as keyof typeof mock] = spy;
        } catch (e) {
            let msg = (e as Error).message;
            const utilName = Config.runner === 'jest' ? 'jest' : Config.runner === 'vitest' ? 'vi' : undefined;
            if (utilName && msg.includes('has only a getter')) {
                msg += `
Inserting a module mock might resolve this problem. Add this code first:

${utilName}.mock('${moduleName}');

Or if you don't want to mock everything from this module, you can use this:

${utilName}.mock('${moduleName}', () => ({
    ...${utilName}.requireActual('${moduleName}'),
    '${method}': () => undefined,
}));`;
            }
            throw couldNotInitError(msg);
        }
    });
};
