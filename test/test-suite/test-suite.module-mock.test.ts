import { Spy } from '../../src/spy';
import { Config } from '../../src/config';

Spy.setup();

describe('Spy.mockModule', () => {
    it('throws if specified node module cannot be found', () => {
        expect(() => Spy.mockModule('foo', 'bar')).toThrow('spy4js: Could not find given module: "foo"');
        expect(() => Spy.mockModule('rollup/foo', 'bar')).toThrow(/^Cannot find module.*node_modules\/rollup\/foo.*/);
        expect(() => Spy.mockModule('rollup/foo/bar', 'bar')).toThrow(
            'spy4js: Could not find given module: "rollup/foo/bar"'
        );
    });

    it('throws if no CommonJS is used', () => {
        Config.isCJS = false;

        expect(() => Spy.mockModule('foo', 'bar')).toThrow(
            'spy4js: Mocking a module only works if your test runner executes with CommonJS'
        );
    });
});
