/*
 * google styles
 *
 * @flow
 */

module.exports = {
    parser: 'babel-eslint',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        }
    },
    extends: ['eslint:recommended', 'google'],
    // react plugin
    plugins: [
        'flow-vars'
    ],
    rulesDir: './etc',
    // rules
    rules: {
        'semi': [2, 'always'],
        'quotes': [2, 'single'],
        'indent': [2, 4, {SwitchCase: 1}],
        'flow-vars/define-flow-type': 2,
        'flow-vars/use-flow-type': 2,
        'need-flow': 2,
        'no-var': 2
    },
    env: {
        browser: true,
        node: true,
        mocha: true
    }
};