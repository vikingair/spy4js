/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */
import { createMock } from '../../src/mock';
import { Spy } from '../../src/spy';

Spy.setup();

const IRL = {
    saveTheWorld: () => 'feed some koalas',
    doWithTree: (action: string) => `${action} the tree`,
    giveBanana: (to: string) => `Give ${to} a banana`,
};

const Matrix = { tearDown: () => 1337, startup: () => 1 };

describe('Mocks - 1', () => {
    const IRL$Mock = createMock(IRL, ['doWithTree', 'giveBanana']);
    const { doWithTree, giveBanana, saveTheWorld } = IRL$Mock as any;

    it('creates uninitialized mocks', () => {
        expect(saveTheWorld).toBe(undefined);
        expect(doWithTree).toThrowErrorMatchingInlineSnapshot(`"Method 'doWithTree' was not initialized on Mock."`);
        expect(giveBanana).toThrowErrorMatchingInlineSnapshot(`"Method 'giveBanana' was not initialized on Mock."`);
    });
});

describe('Mocks - 2', () => {
    const IRL$Mock = createMock(IRL, ['doWithTree', 'giveBanana']);

    it('mocks specified methods', () => {
        expect((IRL$Mock as any).saveTheWorld).toBe(undefined);
        IRL$Mock.doWithTree.transparent();
        expect(IRL$Mock.doWithTree('kiss')).toBe('kiss the tree');
        IRL$Mock.giveBanana.transparent();
        expect(IRL$Mock.giveBanana('Joe')).toBe('Give Joe a banana');

        IRL$Mock.doWithTree.configure({ persistent: true });
        IRL$Mock.doWithTree.returns('was persisted');
    });

    it('allows to persist mocks', () => {
        expect(IRL.doWithTree('whatever')).toBe('was persisted');
        IRL$Mock.doWithTree.configure({ persistent: false });
    });
});

describe('Mocks - 3', () => {
    const IRL$Mock = createMock(IRL, ['saveTheWorld']);
    const Matrix$Mock = createMock(Matrix, ['tearDown']);

    it('creates multiple mocks', () => {
        IRL$Mock.saveTheWorld.transparent();
        expect(IRL$Mock.saveTheWorld()).toBe('feed some koalas');
        expect((IRL$Mock as any).doWithTree).toBe(undefined);
        expect((IRL$Mock as any).giveBanana).toBe(undefined);

        Matrix$Mock.tearDown.transparent();
        expect(Matrix$Mock.tearDown()).toBe(1337);
        expect((Matrix$Mock as any).startup).toBe(undefined);
    });
});

describe('Mocks - 4', () => {
    it('fails if called within test', () => {
        expect(() => createMock(IRL, ['doWithTree'])).toThrow('Mocks can only be created outside of tests');
    });
});
