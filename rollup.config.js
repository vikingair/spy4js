import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'index.ts',
    plugins: [
        typescript(),
        babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**',
            presets: [
                [
                    '@babel/preset-env',
                    { modules: false, targets: { node: '12' } },
                ],
            ],
        }),
        resolve({ preferBuiltins: true }),
    ],
    output: [
        {
            dir: 'dist/cjs',
            format: 'cjs',
        },
        {
            dir: 'dist/esm',
            format: 'esm',
        },
    ],
};
