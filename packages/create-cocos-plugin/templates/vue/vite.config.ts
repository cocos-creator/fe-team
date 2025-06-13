import { cocosPanelConfig, cocosPanel } from '@cocos-fe/vite-plugin-cocos-panel';
import vue from '@vitejs/plugin-vue';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    /**
     *  注意事项:
     *  你能发现我们在 dev 和 build 都是走的 vite build，只是通过 --mode development 来区分开发环境 https://cn.vitejs.dev/guide/env-and-mode.html
     *  因为我们每次构建都需要实际构建出 js 文件，供编辑器读取，所以不能用 vite 的 dev 模式 (它不会构建产物到 dist)
     */
    const isDev = mode === 'development';

    return {
        build: {
            lib: {
                entry: {
                    browser: './src/browser/index.ts',
                    panel: './src/panels/panel.ts',
                },
                formats: ['cjs'],
                fileName: (format, entryName) => `${entryName}.${format}`,
            },
            watch: isDev
                ? {
                      include: ['./src/**/*.ts', './src/**/*.vue', './src/**/*.css'],
                  }
                : null,
            target: 'modules',
            minify: false,
            sourcemap: isDev
                ? process.platform === 'win32'
                    ? 'inline'
                    : true // windows 下 sourcemap 只有 inline 模式才会生效
                : false,
        },
        plugins: [
            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: (tag) => tag.startsWith('ui-'),
                    },
                },
            }),
            nodeExternals({
                builtins: true, // 排除 node 的内置模块
                deps: false, // 将依赖打入 dist，发布的时候可以删除 node_modules
                devDeps: true,
                peerDeps: true,
                optDeps: true,
            }),
            cocosPanelConfig(),
            cocosPanel(),
        ],
    };
});
