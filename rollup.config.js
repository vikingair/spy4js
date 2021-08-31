import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import fs from 'fs';

const extensions = ['.ts', '.tsx'];
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

export default {
    input: 'index.ts',
    plugins: [
        resolve({ extensions }),
        babel({
            extensions,
            babelHelpers: 'bundled',
            exclude: 'node_modules/**',
        }),
    ],
    external: Object.keys(packageJson.dependencies),
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
