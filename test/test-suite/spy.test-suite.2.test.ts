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

describe('TestSuite - with added custom hooks', () => {
    expect(counters.beforeEach).toBe(0);
    expect(counters.afterEach).toBe(0);
    beforeEach(() => {
        counters.beforeEach = counters.beforeEach * 3; // will be applied right after the configured beforeEach
    });
    afterEach(() => {
        counters.afterEach = counters.afterEach * 7; // will be applied right before the configured afterEach
    });
    it('test 1', () => {
        expect(counters.beforeEach).toBe(3); // first hook 0 + 1 --> 1, second hook 1 * 3 --> 3
        expect(counters.afterEach).toBe(0);
    });
    it('test 2', () => {
        expect(counters.beforeEach).toBe(12); // first hook 3 + 1 --> 4, second hook 4 * 3 --> 12
        expect(counters.afterEach).toBe(1); // first hook 0 * 7 --> 0, second hook 0 + 1 --> 1
    });
    it('test 3', () => {
        expect(counters.beforeEach).toBe(39); // first hook 12 + 1 --> 13, second hook 13 * 3 --> 39
        expect(counters.afterEach).toBe(8); // first hook 1 * 7 --> 7, second hook 7 + 1 --> 8
    });
});
