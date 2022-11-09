const { defineConfig } = require('vite');

exports.config = defineConfig({
    build: {
        lib: {
            entry: {
                'browser': './source/browser.ts',
                'panel': './source/panel.js',
            },
        },
        outDir: 'dist',
        rollupOptions: {
            external: ['electron', 'vue'],
        },
    },
});
