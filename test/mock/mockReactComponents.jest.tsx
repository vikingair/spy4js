// @ts-expect-error React import is still required for some reason for Jest.
import React from 'react';
import { render } from '@testing-library/react';
import { _GenericComponent } from '../../src/react';
import { Spy } from '../../src/spy';
import { Component1, Component2 } from './test.reactComponents';
import { Component3 } from './test.reactComponents2';

Spy.setup();

describe('mockReactComponents - minimal', () => {
    Spy.configure({ useGenericReactMocks: false });
    const Mock$TestReactComponents = Spy.mockReactComponents(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./test.reactComponents') as typeof import('./test.reactComponents'),
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

describe('mockReactComponents - generic', () => {
    beforeEach(() => {
        _GenericComponent.serializeAllProps = true;
    });
    Spy.configure({ useGenericReactMocks: true });
    const Mock$TestReactComponents = Spy.mockReactComponents(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./test.reactComponents'),
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
