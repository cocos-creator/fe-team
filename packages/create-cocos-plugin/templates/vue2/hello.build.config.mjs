import { defineConfig } from '@cocos-fe/hello-build';
import { nodeExternals } from 'rollup-plugin-node-externals';
import vue from '@vitejs/plugin-vue2';

export const config = defineConfig({
    build: {
        lib: {
            entry: {
                browser: './source/browser.ts',
                panel: './source/panel.ts',
            },
        },
        outDir: 'dist',
    },
    plugins: [
        nodeExternals({
            builtins: true, // 排除 node 的内置模块
            deps: true,
            devDeps: true,
            peerDeps: true,
            optDeps: true,
        }),
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('ui-'),
                },
            },
        }),
    ],
});
