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
            external: ['electron'],
        },
    },
    framework: 'vue3',
});
