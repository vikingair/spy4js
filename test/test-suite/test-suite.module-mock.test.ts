import { _testSuite } from '../../src/test-suite';
import { Spy } from '../../src/spy';

describe('Spy.mockModule', () => {
    it('throws if no CommonJS is used', () => {
        _testSuite.isCJS = false;

        expect(() => Spy.mockModule('foo', 'bar')).toThrow(
            'Spy.moduleMock works only if your test runner executes with CommonJS'
        );
    });
});
