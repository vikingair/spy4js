/*
 * @flow
 */

import { differenceOf } from '../src/utils';
import { equals, equalsNot, throws } from '../util/facts';

describe('Test-Utils', () => {
    it('does throw no exception if an exception will be thrown in "throws"', () => {
        const throwingFunc = () => {
            throw new Error('here it comes');
        };
        throws(throwingFunc);
    });

    it('does throw no exception if an exception with correct message will be thrown in "throws"', () => {
        const throwingFunc = () => {
            throw new Error('here it comes');
        };
        throws(throwingFunc, { message: 'here it comes' });
    });

    it('does throw no exception if an exception with correct message part will be thrown in "throws"', () => {
        const throwingFunc = () => {
            throw new Error('here it comes');
        };
        throws(throwingFunc, { partOfMessage: 'comes' });
    });

    it('does throw an exception if an exception will not be thrown in "throws"', done => {
        const notThrowingFunc = () => 'hello';
        try {
            throws(notThrowingFunc);
        } catch (expectedException) {
            done();
        }
    });

    it('does throw an exception if an exception with incorrect message will be thrown in "throws"', done => {
        const throwingFunc = () => {
            throw new Error('here it comes');
        };
        try {
            throws(throwingFunc, { message: 'what does come?' });
        } catch (expectedException) {
            done();
        }
    });

    it('does throw an exception if an exception without message part will be thrown in "throws"', done => {
        const throwingFunc = () => {
            throw new Error('here it comes');
        };
        try {
            throws(throwingFunc, { partOfMessage: 'NOT IN THERE' });
        } catch (expectedException) {
            done();
        }
    });

    it('does throw no exception if an comparison returns no difference in "equals"', () => {
        const firstObj = { attr1: 'string', attr2: 12 };
        const secondObj = { attr1: 'string', attr2: 12 };
        equals(firstObj, secondObj);
        // but does throw using "equalsNot"
        throws(() => equalsNot(firstObj, secondObj), {
            message: 'The given inputs were equal!',
        });
    });

    it('does throw an exception if an comparison returns a difference in "equals"', done => {
        const firstObj = { attr1: 'string', attr2: 12 };
        const secondObj = { attr1: 'string', attr2: 13 };
        try {
            equals(firstObj, secondObj);
        } catch (expectedException) {
            // but does not throw using "equalsNot"
            equalsNot(firstObj, secondObj);
            done();
        }
    });

    it('does not consider any own equals function when comparing with "equals"', done => {
        const eqFunc = () => true;
        const firstObj = { equals: eqFunc, attr1: 'string', attr2: 12 };
        const secondObj = { equals: eqFunc, attr1: 'string', attr2: 13 };
        if (
            differenceOf(firstObj, secondObj, { useOwnEquals: true }) !==
            undefined
        ) {
            throw new Error(
                '"differenceOf was expected to use the own equals functions!"'
            );
        }
        try {
            equals(firstObj, secondObj);
        } catch (expectedException) {
            // but does not throw using "equalsNot"
            equalsNot(firstObj, secondObj);
            done();
        }
    });
});
