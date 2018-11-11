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

type MockInfo = { mock: Object, mocked: Object };
export const _mocks: MockInfo[] = [];
const registerMock = (mocked: Object, mock: Object = {}): Object => {
    _mocks.push({ mocked, mock });
    return mock;
};

export const createMock = (obj: Object, methods: string[]): Object => {
    const mock = registerMock(obj);
    forEach(methods, (_, method: string) => {
        mock[method] = uninitialized(method);
    });
    return mock;
};

const initMock = ({ mocked, mock }: MockInfo, spyOn: SpyOn): void => {
    forEach(mock, (method: string) => {
        mock[method] = spyOn(mocked, method);
    });
};

export const initMocks = (spyOn: SpyOn): void => {
    forEach(_mocks, (_, mock: MockInfo) => initMock(mock, spyOn));
};
