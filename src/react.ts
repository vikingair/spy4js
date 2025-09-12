import { serialize } from './serializer';

// can be computational expensive and cause some issue if serialization would fail
// maybe we allow to configure it after some time, as it might be very useful
export const _GenericComponent = { serializeAllProps: false };
export const createGenericComponent = (method: string) => (props: any) => {
    const { children, ...rest } = props;
    const dataProps = _GenericComponent.serializeAllProps
        ? Object.fromEntries(Object.entries(rest).map(([name, v]) => ['data-prop-' + name.toLowerCase(), serialize(v)]))
        : {};
    return {
        $$typeof: Symbol.for('react.transitional.element'),
        type: 'samp',
        props: { 'data-component': method, children, ...dataProps },
        key: null,
        _owner: null,
        _store: {},
    };
};

export const createMinimalComponent = () => () => null;
