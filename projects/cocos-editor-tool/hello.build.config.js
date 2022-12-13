const { defineConfig } = require('vite');

exports.config = defineConfig({
    build: {
        lib: {
            entry: {
                'browser': './source/browser.ts',
                'panel': './source/panel.js',
                'build': './source/build.js',
                'build-hooks': './source/build-hooks.js',
                'panel-webview': './source/panel-webview.js',
                'preload': './source/preload.js',
            },
        },
        outDir: 'dist',
        rollupOptions: {
            external: ['electron', 'vue'],
        },
    },
});
