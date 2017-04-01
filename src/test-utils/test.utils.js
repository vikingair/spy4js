/*
 * @flow
 */

import {differenceOf} from '../utils';

const throws = (func:Function, messageToCheck?:string):void => {
    try {
        func();
    } catch (expectedError) {
        if (messageToCheck !== undefined &&
            messageToCheck !== expectedError.message) {
            throw new Error(`Expected the error message "${messageToCheck}"` +
                `, but received ${expectedError.message}.`);
        }
        return;
    }
    throw new Error('Expected an error to be thrown!');
};

const equals = (p1:any, p2:any):void => {
    // we will make here pure deep comparison and do
    // not consider any own "equals" methods
    const diff = differenceOf(p1, p2, {useOwnEquals: false});
    if (diff !== undefined) {
        throw new Error(
            `Expected equality, but found differences:\n\n${diff}\n\n`);
    }
};

export {equals, throws};
