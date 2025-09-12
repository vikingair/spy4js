import { render } from '@testing-library/react';
import { serialize } from '../../src/serializer';
import { Spy } from '../../src/spy';
import { differenceOf } from '../../src/utils';

Spy.setup();

describe('Spy.mockModule', () => {
    const Mock$Utils = Spy.mock(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../../src/utils') as typeof import('../../src/utils'),
        'differenceOf',
        'toError'
    );

    it('does something', () => {
        Mock$Utils.differenceOf.returns('42');
        expect(differenceOf('foo', 'bar')).toBe('42');
        expect(serialize({ foo: 'bar' })).toBe("{foo: 'bar'}");
    });
});

describe('Spy.mockModule.2', () => {
    const Mock$Serializer = Spy.mock(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../../src/serializer') as typeof import('../../src/serializer'),
        'serialize'
    );

    it('does something', () => {
        Mock$Serializer.serialize.returns('42');
        expect(differenceOf('foo', 'bar')).toBe('different string');
        expect(serialize({ foo: 'bar' })).toBe('42');
    });
});

jest.mock('@testing-library/react');
describe('Spy.mockModule - with only getter property', () => {
    const Mock$ReactTestingLibrary = Spy.mock(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('@testing-library/react') as typeof import('@testing-library/react'),
        'render'
    );

    it('replaces the function by our spy', () => {
        expect(render).toBe(Mock$ReactTestingLibrary.render);
        expect(render('foo' as any)).toBe(undefined);
        Mock$ReactTestingLibrary.render.wasCalledWith('foo');
    });
});
