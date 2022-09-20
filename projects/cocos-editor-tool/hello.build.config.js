const { defineConfig } = require('vite');

exports.config = defineConfig({
    build: {
        outDir: 'dist',
        rollupOptions: {
            external: ['electron'],
        },
    },
});

exports.libs = {
    'browser': './source/browser.js',
    'panel': './source/panel.js',
};
