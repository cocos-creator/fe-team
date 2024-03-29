// TODO: 待所有工作流都升级到采用 esm 标准之后，可以剥离对 rollup 的依赖，直接提供 esm 的源文件即可。

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
            entryFileNames: '[name].cjs', // entryFileNames: '[name].[format].js',
            format: 'cjs',
        },
        {
            dir: 'bin',
            entryFileNames: '[name].mjs',
            format: 'es',
        },
    ],
    plugins: [externals(), del({ targets: 'bin/*' })],
    external: [],
};
