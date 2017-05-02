/*
 * @flow
 */

import {differenceOf} from '../src/utils';

const throws = (
    func:Function,
    check:{message?:string, partOfMessage?:string} = {}
):void => {
    try {
        func();
    } catch (expectedError) {
        if (check.message !== undefined &&
            check.message !== expectedError.message) {
            throw new Error(`Expected the error message "${check.message}"` +
                `, but received ${expectedError.message}.`);
        } else if (check.partOfMessage !== undefined &&
            expectedError.message.indexOf(check.partOfMessage) === -1) {
            throw new Error('Expected that the error message\n\n' +
                expectedError.message +
                `\n\nincludes: ${check.partOfMessage}.`
            );
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

const equalsNot = (p1:any, p2:any):void => {
    try {
        equals(p1, p2);
    } catch (expectedError) {
        return;
    }
    throw new Error('The given inputs were equal!');
};

export {equals, equalsNot, throws};
