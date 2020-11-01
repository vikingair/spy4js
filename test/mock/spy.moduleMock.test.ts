import { differenceOf } from '../../src/utils';
import { Spy } from '../../src/spy';
import { serialize } from '../../src/serializer';
import { watch } from 'rollup';

describe('Spy.mockModule', () => {
    const Mock$Utils = Spy.mockModule('../../src/utils', 'differenceOf', 'toError');

    it('does something', () => {
        Mock$Utils.differenceOf.returns(42);
        expect(differenceOf('foo', 'bar')).toBe(42);
        expect(serialize({ foo: 'bar' })).toBe("{foo: 'bar'}");
    });
});

describe('Spy.mockModule.2', () => {
    const Mock$Serializer = Spy.mockModule('../../src/serializer', 'serialize');

    it('does something', () => {
        Mock$Serializer.serialize.returns(42);
        expect(differenceOf('foo', 'bar')).toBe('different string');
        expect(serialize({ foo: 'bar' })).toBe(42);
    });
});

describe('Spy.mockModule.node_module', () => {
    const Mock$Rollup = Spy.mockModule('rollup', 'watch');

    it('does something', () => {
        expect(watch({})).toBe(undefined);
        Mock$Rollup.watch.returns(42);
        expect(watch({})).toBe(42);
    });
});

describe('Spy.mockReactComponents', () => {
    const Mock$Rollup = Spy.mockReactComponents('rollup', 'watch');

    it('does something', () => {
        expect(watch({ watch: false })).toBe(null);
        Mock$Rollup.watch.wasCalledWith({ watch: false });
    });
});
