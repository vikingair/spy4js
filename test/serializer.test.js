/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component, Fragment } from 'react';
import { equals } from '../util/facts';
import { serialize } from '../src/serializer';
import { IGNORE } from '../src/utils';

describe('serialize', () => {
    it('serializes primitives', () => {
        equals(serialize(undefined), 'undefined');
        equals(serialize(null), 'null');
        equals(serialize('test'), '"test"');
        equals(serialize(12), '12');
        equals(serialize(true), 'true');
        equals(serialize(/^abc$/), '//^abc$//');
        equals(serialize(IGNORE), '>IGNORED<');
        equals(serialize(Symbol('test')), 'Symbol(test)');
        equals(serialize(() => {}), 'Function');
        const date = new Date();
        equals(serialize(date), `>Date:${Number(date)}<`);
    });
    it('serializes arrays', () => {
        equals(serialize([]), '[]');
        equals(
            serialize([1, 'test', IGNORE, /^abc$/]),
            '[1, "test", >IGNORED<, //^abc$//]'
        );
    });
    it('serializes class instances as objects with different name as prefix', () => {
        class Clazz {
            _prop: number;
            constructor(prop: number) {
                this._prop = prop;
            }
        }
        class Other {
            _attr: Clazz;
            _other: string;

            constructor(prop: number, other: string) {
                this._attr = new Clazz(prop);
                this._other = other;
            }
        }
        const inst = new Clazz(12);
        const inst2 = new Other(42, 'test');
        equals(serialize(inst), 'Clazz{_prop: 12}');
        equals(
            serialize(inst2),
            'Other{_attr: Clazz{_prop: 42}, _other: "test"}'
        );
    });
    it('serializes objects', () => {
        equals(serialize({}), '{}');
        equals(
            serialize({ prop1: 12, prop2: 'test' }),
            '{prop1: 12, prop2: "test"}'
        );
    });
    it('serializes cyclomatic structures', () => {
        const o: any = { prop1: 'test', prop2: { prop21: 12 } };
        o.prop3 = o;
        o.prop2.prop22 = o;
        equals(
            serialize(o),
            '{prop1: "test", prop2: {prop21: 12, prop22: >CYCLOMATIC<}, prop3: >CYCLOMATIC<}'
        );
    });
    it('serializes non cyclomatic structures but repeating elements', () => {
        const a = { some: 'prop' };
        const o: any = { prop1: 'test', prop2: { prop21: 12 } };
        o.prop3 = a;
        o.prop2.prop22 = a;
        equals(
            serialize(o),
            '{prop1: "test", prop2: {prop21: 12, prop22: {some: "prop"}}, prop3: {some: "prop"}}'
        );
    });
    it('serializes all together', () => {
        const o: any = { prop1: 'test', prop2: { prop21: 12 } };
        o.prop3 = o;
        o.prop2.prop22 = o;
        class Clazz {
            _prop: number;
            constructor(prop: number) {
                this._prop = prop;
            }
        }
        const inst = new Clazz(12);
        o.prop4 = [1, 3, inst, { attr: IGNORE, attr2: Symbol('test') }];

        equals(
            serialize(o),
            '{prop1: "test", ' +
                'prop2: {prop21: 12, prop22: >CYCLOMATIC<}, ' +
                'prop3: >CYCLOMATIC<, ' +
                'prop4: [1, 3, Clazz{_prop: 12}, {attr: >IGNORED<, attr2: Symbol(test)}]}'
        );
    });

    it('serializes simple jsx', () => {
        const clickHandler = () => {};
        const o = (
            <div className="test" key="test-key">
                <p style={{ background: 'red' }}>Some text for the test</p>
                <button onClick={clickHandler}>Click here</button>
            </div>
        );

        expect(serialize(o)).toBe(
            '<div className="test" key="test-key">' +
                '<p style={{background: "red"}}>Some text for the test</p>' +
                '<button onClick={clickHandler}>Click here</button></div>'
        );
    });

    it('serializes react components', () => {
        class TestComponent extends Component<{
            str: string,
            bool: boolean,
        }> {
            render() {
                return (
                    <div className={this.props.str}>
                        {String(this.props.bool)}
                    </div>
                );
            }
        }
        const o = (
            <TestComponent str="test" bool key="test-key" ref="test-ref" /> // eslint-disable-line
        );
        const o2 = (
            <TestComponent str="test" bool key="test-key">
                <div className="foo">Inner text</div>
            </TestComponent>
        );

        expect(serialize(o)).toBe(
            '<TestComponent str="test" bool={true} key="test-key" ref="test-ref" />'
        );

        expect(serialize(o2)).toBe(
            '<TestComponent str="test" bool={true} key="test-key"><div className="foo">Inner text</div></TestComponent>'
        );
    });

    it('serializes react functional components', () => {
        const TestComponent = (props: Object) => (
            <div className={props.str}>{String(props.bool)}</div>
        );
        const newRefApiRef = React.createRef();
        const o = (
            <TestComponent str="test" bool key="test-key" ref={newRefApiRef} />
        );

        expect(serialize(o)).toBe(
            '<TestComponent str="test" bool={true} key="test-key" ref={{current: null}} />'
        );
    });

    it('serializes react fragment', () => {
        const o = (
            <Fragment key="foo">
                <div>Test that</div>
            </Fragment>
        );

        expect(serialize(o)).toBe(
            '<Fragment key="foo"><div>Test that</div></Fragment>'
        );
    });

    it('serializes fallbacks for failing react serialization', () => {
        expect(serialize({ $$typeof: Symbol.for('foo') })).toBe(
            '{$$typeof: Symbol(foo)}' // unknown symbol for the $$typeof attribute
        );
        expect(serialize({ $$typeof: Symbol.for('react.special') })).toBe(
            '{$$typeof: Symbol(react.special)}' // unknown symbol for the $$typeof attribute, which starts with 'react.'
        );
        expect(
            serialize({
                $$typeof: Symbol.for('react.element'),
                type: Symbol.for('foo'), // unknown symbol as type
                props: {},
            })
        ).toBe('<UNKNOWN />');
        expect(
            serialize({
                $$typeof: Symbol.for('react.element'),
                type: 1234, // unknown type for field type
                props: {},
            })
        ).toBe('<UNKNOWN />');
    });
});
