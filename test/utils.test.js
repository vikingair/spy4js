/*
 * @flow
 */

import {differenceOf} from '../src/utils';

// I am comparing here with those basic comparators,
// because I want to decouple my testing from any external
// test expectation libraries. Those to methods and the
// following tests are building the base for all following
// test facts.
const is = (p1:any, p2:any) : void => {
    if (p1 !== p2) {
        throw new Error('Expected identical objects!');
    }
};

const isNot = (p1:any, p2:any) : void => {
    if (p1 === p2) {
        throw new Error('Expected non-identical objects!');
    }
};

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

        isNot(someInstance, someOtherInstance);
        is(differenceOf(someInstance, someOtherInstance), undefined);
        is(differenceOf(someInstance, someDifferentInstance),
            '--> attr3 / different date');
    });

    it('should detect flat differences correctly', () => {
        // null and/or undefined
        is(differenceOf(null, null), undefined);
        is(differenceOf(undefined, undefined), undefined);
        is(differenceOf(null, 'test2'), 'null or undefined did not match');
        is(differenceOf(undefined, null), 'null or undefined did not match');
        // string
        is(differenceOf('test', 'test'), undefined);
        is(differenceOf('test1', 'test2'), 'different string');
        // regexp
        is(differenceOf(/./g, /./g), undefined);
        is(differenceOf(/abc/, /ab/), 'different regexp');
        // number
        is(differenceOf(123, 123), undefined);
        is(differenceOf(NaN, NaN), undefined);
        is(differenceOf(NaN, 123), 'different number');
        is(differenceOf(12, -13), 'different number');
        // date
        is(differenceOf(new Date(2016, 12, 24), new Date(2016, 12, 24)),
            undefined);
        is(differenceOf(new Date(2016, 12, 24), new Date(2017, 12, 24)),
            'different date');
        // boolean
        is(differenceOf(true, true), undefined);
        is(differenceOf(true, false), 'different bool');
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
        is(differenceOf(
            new TestClass1('some String'),
            new TestClass1('some String')),
            undefined);
        is(differenceOf(
            new TestClass1('some String'),
            new TestClass2('some String')),
            'different constructor');
    });

    it('should flatly detect different keys length correctly', () => {
        is(differenceOf([1, 2, 'test'], [1, 2, 'test']), undefined);
        is(differenceOf([1, 2, 'test'], [1, 'test']), 'different key length');
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
        is(differenceOf(new TestClass(2), new TestClass(4)), undefined);
        // we want to use substr, so return a string for flow
        const diff = differenceOf(new TestClass(2), new TestClass(5)) || '';
        is(diff.substr(0, 24), 'own equals method failed');
        is(differenceOf(
            new TestClass(2),
            new TestClass(4),
            {useOwnEquals: false}),
            '--> attr / different number');
    });

    it('should default circular structures as compared without failure', () => {
        const a:any = {d: 'test'};
        a.c = a;
        const b:any = {d: 'test'};
        b.c = b;
        is(differenceOf(a, b), undefined);
        b.d = 'test2';
        is(differenceOf(a, b), '--> d / different string');
    });

    it('should make deep equality checks correctly', () => {
        const obj1 = {a: [{a: 'someString'}, {b: 'someString'}]};
        const obj2 = {a: [{a: 'someString'}, {b: 'someOtherString'}]};
        is(differenceOf(obj1, obj2), '--> a / 1 / b / different string');
    });
});
