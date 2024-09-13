import { defineConfig } from 'vite';
import { nodeExternals } from 'rollup-plugin-node-externals';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    base: './',
    build: {
        lib: {
            entry: {
                browser: './src/browser.ts',
                panel: './src/panel.ts',
            },
            formats: ['cjs'],
            fileName: (format, entryName) => `${entryName}.${format}`,
        },
        emptyOutDir: true,
        outDir: 'dist',
        rollupOptions: {
            output: {
                assetFileNames: '[name].[ext]', // 让 css 文件的命名固定，不要携带 hash
            },
        },
        target: 'esnext',
        assetsDir: './', // 直接把所有文件都放 dist
        cssCodeSplit: true, // 因为是多个入口，所以 css 也应该独立
        minify: false,
        watch: {
            include: ['./src/**/*.ts', './src/**/*.vue', './src/**/*.css'],
        },
    },
    server: {
        hmr: {
            overlay: false,
        },
    },
    plugins: [
        vue(),
        nodeExternals({
            builtins: true, // 排除 node 的内置模块
            deps: true,
            devDeps: true,
            peerDeps: true,
            optDeps: true,
        }),
    ],
});
