import React from 'react';

export const Component1: React.FC<{ foo: string; oneMore?: any }> = ({ foo }) => <div id={'component-1'}>{foo}</div>;
export const Component2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div id={'component-2'}>{children}</div>
);
export const Component3: React.FC = () => (
    <div id={'component-3'}>
        <Component1 foo={'in-component-3'} />
    </div>
);
