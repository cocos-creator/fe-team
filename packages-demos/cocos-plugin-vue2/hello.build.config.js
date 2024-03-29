const { defineConfig } = require('vite');

exports.config = defineConfig({
    build: {
        lib: {
            entry: {
                browser: './source/browser.ts',
                panel: './source/panel.ts',
            },
        },
        outDir: 'dist',
        rollupOptions: {
            external: ['electron', 'vue'], // 可以和编辑器里面的 vue2.7 共用
        },
    },
});
