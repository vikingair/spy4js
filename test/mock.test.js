/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { createMock, initMocks, _mocks } from '../src/mock';

const IRL = {
    saveTheWorld: () => 'feed some koalas',
    doWithTree: (action: string) => `${action} the tree`,
    giveBanana: (to: string) => `Give ${to} a banana`,
};

const Matrix = { tearDown: () => 1337, startup: () => 1 };

const testSpyOn = (obj: Object, method: string) => obj[method];

describe('Mocks', () => {
    beforeEach(() => (_mocks.length = 0));

    it('creates uninitialized mocks', () => {
        const IRL$Mock = createMock(IRL, ['doWithTree', 'giveBanana']);

        expect(_mocks.length).toBe(1);
        expect(_mocks[0].mock).toBe(IRL$Mock);
        expect(_mocks[0].mocked).toBe(IRL);

        expect(IRL$Mock.saveTheWorld).toBe(undefined);
        expect(IRL$Mock.doWithTree).toThrow(
            "Method 'doWithTree' was not initialized on Mock."
        );
        expect(IRL$Mock.giveBanana).toThrow(
            "Method 'giveBanana' was not initialized on Mock."
        );
    });

    it('mocks specified methods', () => {
        const IRL$Mock = createMock(IRL, ['doWithTree', 'giveBanana']);
        expect(_mocks.length).toBe(1);
        initMocks(testSpyOn);

        expect(IRL$Mock.saveTheWorld).toBe(undefined);
        expect(IRL$Mock.doWithTree('kiss')).toBe('kiss the tree');
        expect(IRL$Mock.giveBanana('Joe')).toBe('Give Joe a banana');
    });

    it('creates multiple mocks', () => {
        const IRL$Mock = createMock(IRL, ['saveTheWorld']);
        const Matrix$Mock = createMock(Matrix, ['tearDown']);
        expect(_mocks.length).toBe(2);
        initMocks(testSpyOn);

        expect(IRL$Mock.saveTheWorld()).toBe('feed some koalas');
        expect(IRL$Mock.doWithTree).toBe(undefined);
        expect(IRL$Mock.giveBanana).toBe(undefined);

        expect(Matrix$Mock.tearDown()).toBe(1337);
        expect(Matrix$Mock.startup).toBe(undefined);
    });
});
