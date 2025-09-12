import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Spy } from '../../src/spy';
vi.mock('./test.reactComponents', async () => ({ ...((await vi.importActual('./test.reactComponents')) as any) }));

import { render } from '@testing-library/react';
import { _GenericComponent } from '../../src/react';
import { Component1, Component2 } from './test.reactComponents';
import { Component3 } from './test.reactComponents2';

Spy.setup({ expect, beforeEach, afterEach });

// console.log(
//     <samp data-foo={'component-3'}>
//         <Component1 foo={'in-component-3'} />
//     </samp>
// );

describe('mockReactComponents - minimal', async () => {
    Spy.configure({ useGenericReactMocks: false });
    const Mock$TestReactComponents = Spy.mockReactComponents(
        await import('./test.reactComponents'),
        'Component1',
        'Component2'
    );

    it('mocks as plain function', () => {
        expect(Component1({ foo: 'bar' })).toBe(null);
        Mock$TestReactComponents.Component1.wasCalledWith({ foo: 'bar' });
    });

    it('renders component snapshot - nested mocks', () => {
        const { container } = render(
            <Component2>
                <Component1 foo={'bar'} />
            </Component2>
        );
        expect(container).toMatchSnapshot();
    });

    it('renders component snapshot - contained mock', () => {
        const { container } = render(<Component3 />);
        expect(container).toMatchSnapshot();
    });
});

describe('mockReactComponents - generic', async () => {
    beforeEach(() => {
        _GenericComponent.serializeAllProps = true;
    });
    Spy.configure({ useGenericReactMocks: true });
    const Mock$TestReactComponents = Spy.mockReactComponents(
        await import('./test.reactComponents'),
        'Component1',
        'Component2'
    );

    it('mocks as plain function', () => {
        expect((Component1({ foo: 'bar' }) as any).props['data-prop-foo']).toBe("'bar'");
        expect(Mock$TestReactComponents.Component1.getProps().foo).toBe('bar');
        Mock$TestReactComponents.Component1.wasCalledWith({ foo: 'bar' });
    });

    it('renders component snapshot - nested mocks', () => {
        const { container } = render(
            <Component2>
                <Component1 foo={'bar'} oneMore={{ data: Symbol('oneMore') }} />
            </Component2>
        );
        expect(container).toMatchSnapshot();
    });

    it('renders component snapshot - nested mocks - without props', () => {
        _GenericComponent.serializeAllProps = false;
        const { container } = render(
            <Component2>
                <Component1 foo={'bar'} oneMore={{ data: Symbol('oneMore') }} />
                <div>More children</div>
            </Component2>
        );
        expect(container).toMatchSnapshot();
    });

    it('renders component snapshot - contained mock', () => {
        const { container } = render(<Component3 />);
        expect(container).toMatchSnapshot();
    });
});
