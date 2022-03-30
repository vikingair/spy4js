import React from 'react';

export const Component1: React.VFC<{ foo: string; oneMore?: any }> = ({ foo }) => <div id={'component-1'}>{foo}</div>;
export const Component2: React.FC = ({ children }) => <div id={'component-2'}>{children}</div>;
export const Component3: React.VFC = () => (
    <div id={'component-3'}>
        <Component1 foo={'in-component-3'} />
    </div>
);
