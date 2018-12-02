/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

const throws = (
    func: Function,
    check: { message?: string, partOfMessage?: string } = {}
): void => {
    try {
        func();
    } catch (expectedError) {
        if (
            check.message !== undefined &&
            check.message !== expectedError.message
        ) {
            throw new Error(
                `Expected the error message "${check.message}", but received ${
                    expectedError.message
                }.`
            );
        } else if (
            check.partOfMessage !== undefined &&
            expectedError.message.indexOf(check.partOfMessage) === -1
        ) {
            throw new Error(
                'Expected that the error message\n\n' +
                    expectedError.message +
                    `\n\nincludes: ${check.partOfMessage}.`
            );
        }
        return;
    }
    throw new Error('Expected an error to be thrown!');
};

export { throws };
