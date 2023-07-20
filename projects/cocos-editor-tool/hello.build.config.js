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
                'extend-hierarchy': './source/extend/hierarchy.ts',
            },
        },
        outDir: 'dist',
        rollupOptions: {
            external: ['electron', 'vue', '@editor/asset-db'],
            output: {
                banner: 'const a = 1;',
            },
        },
    },
    isVue2: true,
});
