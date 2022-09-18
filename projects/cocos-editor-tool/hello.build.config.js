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
    'browser': './source/browser.ts',
    'panel': './source/panel.ts',
};
