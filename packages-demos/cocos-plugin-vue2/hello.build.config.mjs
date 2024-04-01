import { defineConfig } from '@cocos-fe/hello-build';

export const config = defineConfig({
    build: {
        lib: {
            entry: {
                browser: './source/browser.ts',
                panel: './source/panel.ts',
            },
        },
        outDir: 'dist',
    },
});
