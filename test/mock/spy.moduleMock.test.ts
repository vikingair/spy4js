import { differenceOf } from '../../src/utils';
import { Spy } from '../../src/spy';
import { serialize } from '../../src/serializer';
import { render } from '@testing-library/react';
import { watch } from 'rollup/dist/rollup.js';

Spy.setup();

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
    const Mock$Rollup = Spy.mockModule('rollup/dist/rollup.js', 'watch');

    it('does something', () => {
        expect(watch({})).toBe(undefined);
        Mock$Rollup.watch.returns(42);
        expect(watch({})).toBe(42);
    });
});

jest.mock('@testing-library/react');
describe('Spy.mockModule - with only getter property', () => {
    const Mock$ReactTestingLibrary = Spy.mockModule('@testing-library/react', 'render');

    it('replaces the function by our spy', () => {
        expect(render).toBe(Mock$ReactTestingLibrary.render);
        expect(render('foo' as any)).toBe(undefined);
        Mock$ReactTestingLibrary.render.wasCalledWith('foo');
    });
});
