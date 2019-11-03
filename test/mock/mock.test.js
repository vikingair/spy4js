/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import {
    createMock,
    initMocks,
    _mocks,
    setScope,
    defaultScope,
} from '../../src/mock';

const IRL = {
    saveTheWorld: () => 'feed some koalas',
    doWithTree: (action: string) => `${action} the tree`,
    giveBanana: (to: string) => `Give ${to} a banana`,
};

const Matrix = { tearDown: () => 1337, startup: () => 1 };

const testSpyOn = (obj: Object, method: string) => obj[method];

describe('Mocks', () => {
    beforeEach(() => {
        _mocks[defaultScope].length = 0;
        setScope(undefined);
    });

    it('creates uninitialized mocks', () => {
        const IRL$Mock = createMock(IRL, ['doWithTree', 'giveBanana']);

        expect(_mocks[defaultScope].length).toBe(1);
        expect(_mocks[defaultScope][0].mock).toBe(IRL$Mock);
        expect(_mocks[defaultScope][0].mocked).toBe(IRL);

        expect(IRL$Mock.saveTheWorld).toBe(undefined);
        expect(IRL$Mock.doWithTree).toThrowErrorMatchingInlineSnapshot(
            `"Method 'doWithTree' was not initialized on Mock."`
        );
        expect(IRL$Mock.giveBanana).toThrowErrorMatchingInlineSnapshot(
            `"Method 'giveBanana' was not initialized on Mock."`
        );
    });

    it('mocks specified methods', () => {
        setScope('Test Scope');
        const IRL$Mock = createMock(IRL, ['doWithTree', 'giveBanana']);
        expect(_mocks['Test Scope'].length).toBe(1);
        initMocks(testSpyOn, 'Test Scope');

        expect(IRL$Mock.saveTheWorld).toBe(undefined);
        expect(IRL$Mock.doWithTree('kiss')).toBe('kiss the tree');
        expect(IRL$Mock.giveBanana('Joe')).toBe('Give Joe a banana');
    });

    it('creates multiple mocks', () => {
        const IRL$Mock = createMock(IRL, ['saveTheWorld']);
        const Matrix$Mock = createMock(Matrix, ['tearDown']);
        expect(_mocks[defaultScope].length).toBe(2);
        initMocks(testSpyOn);

        expect(IRL$Mock.saveTheWorld()).toBe('feed some koalas');
        expect(IRL$Mock.doWithTree).toBe(undefined);
        expect(IRL$Mock.giveBanana).toBe(undefined);

        expect(Matrix$Mock.tearDown()).toBe(1337);
        expect(Matrix$Mock.startup).toBe(undefined);
    });
});
