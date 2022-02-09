export const createGenericComponent = (method: string) => (props: any) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'samp',
    props: { 'data-component': method, ...props },
    ref: null,
});

export const createMinimalComponent = () => () => null;
