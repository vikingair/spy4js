/*
 * @flow
 */

import expect from 'expect';
import {differenceOf} from './equality';

describe('Spy - Equality', () => {
    it('should make an equality check for classes correctly', () => {
        const TestClass = class {
            attr1:string;
            attr2:number;
            attr3:Date;

            constructor(attr1:string, attr2:number, attr3:Date) { // eslint-disable-line
                this.attr1 = attr1;
                this.attr2 = attr2;
                this.attr3 = attr3;
            }

            method():string { // eslint-disable-line require-jsdoc
                return this.attr1 + this.attr2.toString() +
                    this.attr3.toDateString();
            }
        };

        const someInstance = new TestClass('test', 42, new Date(2016, 12, 24));
        const someOtherInstance =
            new TestClass('test', 42, new Date(2016, 12, 24));
        const someDifferentInstance =
            new TestClass('test', 42, new Date(2016, 12, 23));

        expect(someInstance === someOtherInstance).toBe(false);
        expect(differenceOf(someInstance, someOtherInstance)).toBe(undefined);
        expect(differenceOf(someInstance, someDifferentInstance))
            .toBe('--> attr3 / different date');
    });

    it('should detect flat differences correctly', () => {
        // null and/or undefined
        expect(differenceOf(null, null)).toBe(undefined);
        expect(differenceOf(undefined, undefined)).toBe(undefined);
        expect(differenceOf(null, 'test2'))
            .toBe('null or undefined did not match');
        expect(differenceOf(undefined, null))
            .toBe('null or undefined did not match');
        // string
        expect(differenceOf('test', 'test')).toBe(undefined);
        expect(differenceOf('test1', 'test2')).toBe('different string');
        // regexp
        expect(differenceOf(/./g, /./g)).toBe(undefined);
        expect(differenceOf(/abc/, /ab/)).toBe('different regexp');
        // number
        expect(differenceOf(123, 123)).toBe(undefined);
        expect(differenceOf(NaN, NaN)).toBe(undefined);
        expect(differenceOf(NaN, 123)).toBe('different number');
        expect(differenceOf(12, -13)).toBe('different number');
        // date
        expect(differenceOf(
            new Date(2016, 12, 24),
            new Date(2016, 12, 24))
        ).toBe(undefined);
        expect(differenceOf(
            new Date(2016, 12, 24),
            new Date(2017, 12, 24))
        ).toBe('different date');
        // boolean
        expect(differenceOf(true, true)).toBe(undefined);
        expect(differenceOf(true, false)).toBe('different bool');
    });

    it('should detect flat differences for classes correctly', () => {
        const TestClass1 = class {
            attr:string;
            constructor(attr:string) { // eslint-disable-line require-jsdoc
                this.attr = attr;
            }
        };
        const TestClass2 = class {
            attr:string;
            constructor(attr:string) { // eslint-disable-line require-jsdoc
                this.attr = attr;
            }
        };
        expect(differenceOf(
            new TestClass1('some String'),
            new TestClass1('some String'))
        ).toBe(undefined);
        expect(differenceOf(
            new TestClass1('some String'),
            new TestClass2('some String'))
        ).toBe('different constructor');
    });

    it('should flatly detect different keys length correctly', () => {
        expect(differenceOf([1, 2, 'test'], [1, 2, 'test'])).toBe(undefined);
        expect(differenceOf([1, 2, 'test'], [1, 'test']))
            .toBe('different key length');
    });

    it('should compare with defined equals key, if this exists', () => {
        const TestClass = class {
            attr:number;
            constructor(attr:number) { // eslint-disable-line require-jsdoc
                this.attr = attr;
            }
            equals(other:TestClass):boolean { // eslint-disable-line
                // returning true if both attr are odd or both are even
                return !((this.attr - other.attr) % 2);
            }
        };
        expect(differenceOf(new TestClass(2), new TestClass(4)))
            .toBe(undefined);
        expect(differenceOf(new TestClass(2), new TestClass(5)))
            .toInclude('own equals method failed');
        expect(differenceOf(
            new TestClass(2),
            new TestClass(4),
            {useOwnEquals: false})
        ).toBe('--> attr / different number');
    });

    it('should default circular structures as compared without failure', () => {
        const a:any = {d: 'test'};
        a.c = a;
        const b:any = {d: 'test'};
        b.c = b;
        expect(differenceOf(a, b)).toBe(undefined);
        b.d = 'test2';
        expect(differenceOf(a, b)).toBe('--> d / different string');
    });

    it('should make deep equality checks correctly', () => {
        const obj1 = {a: [{a: 'someString'}, {b: 'someString'}]};
        const obj2 = {a: [{a: 'someString'}, {b: 'someOtherString'}]};
        expect(differenceOf(obj1, obj2))
            .toBe('--> a / 1 / b / different string');
    });
});
