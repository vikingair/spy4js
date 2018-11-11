/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { Spy } from '../src/spy';

const IRL = {
    saveTheWorld: () => 'feed some koalas',
    doWithTree: (action: string) => `${action} the tree`,
    giveBanana: (to: string) => `Give ${to} a banana`,
};

const Matrix = { tearDown: () => 1337, startup: () => 1 };

// you may and should initialize all mocks outside of your "describe"
// the reason is: Once a Mock was created it will be initialized by
// any other describe on calling "initMocks". This might lead to
// confusion when the mock was created within a certain describe block

// the next line does not modify the object IRL, but saves the reference
const IRL$Mock = Spy.mock(IRL, 'saveTheWorld', 'giveBanana');

const Matrix$Mock = Spy.mock(Matrix, 'startup');

describe('Spy - Mocks', () => {
    it('IRL$Mock: did mock the methods and applied spies', () => {
        IRL$Mock.saveTheWorld.returns('saved it!');

        expect(IRL.saveTheWorld()).toBe('saved it!');
        expect(IRL.doWithTree('burn')).toBe('burn the tree');
        expect(IRL.giveBanana('Mike')).toBe(undefined);

        expect(IRL$Mock.doWithTree).toBe(undefined);
        IRL$Mock.saveTheWorld.wasCalled(1);
        IRL$Mock.giveBanana.hasCallHistory('Mike');
    });

    it('Matrix$Mock: did mock the methods and applied spies', () => {
        Matrix$Mock.startup.returns('done');

        expect(Matrix.startup()).toBe('done');
        expect(Matrix.tearDown()).toBe(1337);

        expect(Matrix$Mock.tearDown).toBe(undefined);
        Matrix$Mock.startup.wasCalled(1);
    });
});
