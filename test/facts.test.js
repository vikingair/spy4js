/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { throws } from '../util/facts';

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
});
