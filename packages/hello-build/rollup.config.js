 
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';
import externals from 'rollup-plugin-node-externals';
import del from 'rollup-plugin-delete';

export default {
    input: {
        core: 'src/core.js',
        index: 'src/index.js',
    },
    output: [
        {
            dir: 'bin',
            // entryFileNames: '[name].[format].js',
            entryFileNames: '[name].cjs',
            format: 'cjs',
        },
        {
            dir: 'bin',
            entryFileNames: '[name].mjs',
            format: 'es',
        },
    ],
    plugins: [
        preserveShebangs(),
        externals(),
        del({ targets: 'bin/*' }),
    ],
    external: [],
};