// @flow

import { differenceOf } from '../../src/utils';
import { Spy } from '../../src/spy';
import { serialize } from '../../src/serializer';
import { watch } from 'rollup';

describe('Spy.moduleMock', () => {
    const Mock$Utils = Spy.mockModule(
        '../../src/utils',
        'differenceOf',
        'toError'
    );

    it('does something', () => {
        Mock$Utils.differenceOf.returns(42);
        expect(differenceOf('foo', 'bar')).toBe(42);
        expect(serialize({ foo: 'bar' })).toBe("{foo: 'bar'}");
    });
});

describe('Spy.moduleMock.2', () => {
    const Mock$Serializer = Spy.mockModule('../../src/serializer', 'serialize');

    it('does something', () => {
        Mock$Serializer.serialize.returns(42);
        expect(differenceOf('foo', 'bar')).toBe('different string');
        expect(serialize({ foo: 'bar' })).toBe(42);
    });
});

describe('Spy.moduleMock.3', () => {
    const Mock$Rollup = Spy.mockModule('rollup', 'watch');

    it('does something', () => {
        Mock$Rollup.watch.returns(42);
        expect(watch('foo', 'bar')).toBe(42);
    });
});
