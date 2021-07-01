/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */
import { TestSuite } from '../../src/test-suite';

const counters = { beforeEach: 0, afterEach: 0 };

const increaseBeforeEach = () => {
    ++counters.beforeEach;
};

const increaseAfterEach = () => {
    ++counters.afterEach;
};

TestSuite.configure({
    beforeEach: increaseBeforeEach,
    afterEach: increaseAfterEach,
});

describe('TestSuite - with added counters', () => {
    expect(counters.beforeEach).toBe(0);
    expect(counters.afterEach).toBe(0);
    it('test 1', () => {
        expect(counters.beforeEach).toBe(1);
        expect(counters.afterEach).toBe(0);
    });
    it('test 2', () => {
        expect(counters.beforeEach).toBe(2);
        expect(counters.afterEach).toBe(1);
    });
});

describe('TestSuite - another one', () => {
    expect(counters.beforeEach).toBe(0); // notice this
    expect(counters.afterEach).toBe(0); //  --> jest executes first all describes and then applies hooks to each test

    it('test 1', () => {
        expect(counters.beforeEach).toBe(3);
        expect(counters.afterEach).toBe(2);
    });
});
