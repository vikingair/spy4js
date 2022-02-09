import { differenceOf } from '../../src/utils';
import { Spy } from '../../src/spy';
import { serialize } from '../../src/serializer';
import { watch } from 'rollup';
// @ts-ignore
import { buildExternalHelpers } from '@babel/core';

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

jest.mock('@babel/core');
describe('Spy.mockModule - with only getter property', () => {
    const Mock$BabelCore = Spy.mockModule('@babel/core', 'buildExternalHelpers');

    it('replaces the function by our spy', () => {
        expect(buildExternalHelpers).toBe(Mock$BabelCore.buildExternalHelpers);
        expect(buildExternalHelpers('foo')).toBe(undefined);
        Mock$BabelCore.buildExternalHelpers.wasCalledWith('foo');
    });
});
