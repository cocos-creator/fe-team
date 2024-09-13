import { defineConfig } from 'vite';
import { nodeExternals } from 'rollup-plugin-node-externals';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
    /**
     *  注意事项:
     *  vite 在构建 lib 模式的时候，是没有 dev 服务的，dev 主要用于 web 应用
     *  所以在 package.json 的 scripts 里 dev 和 build 都是执行 vite build
     *  只是在 dev 的脚本里，手动指定了 "--mode development" https://cn.vitejs.dev/guide/env-and-mode.html
     *  然后在 development 模式下，我们配置 watch 的配置
     */
    const isDev = mode === 'development';

    return {
        base: './',
        build: {
            lib: {
                entry: {
                    browser: './src/browser/index.ts',
                    panel_default: './src/panels/default.ts',
                },
                formats: ['cjs'],
                fileName: (format, entryName) => `${entryName}.${format}`,
            },
            watch: isDev
                ? {
                      include: ['./src/**/*.ts', './src/**/*.vue', './src/**/*.css'],
                  }
                : null,
            rollupOptions: {
                output: {
                    assetFileNames: '[name].[ext]', // 让 css 文件的命名固定，不要携带 hash
                },
            },
            target: 'esnext',
            assetsDir: './', // 直接把所有文件都放 dist
            cssCodeSplit: true, // 因为是多个入口，所以 css 也应该独立
            emptyOutDir: true,
            outDir: 'dist',
            minify: false,
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
                deps: true,
                devDeps: false,
                peerDeps: false,
                optDeps: false,
            }),
        ],
    };
});
