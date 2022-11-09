
import { build, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { statSync } from 'fs';
import builtinModules from './builtin-modules.js';
import { merge } from 'webpack-merge';
import { pathToFileURL } from 'node:url';

export function createViteBuild(taskConfig) {
    const { project: extensionPath, config = {} } = taskConfig;
    config.root = config.root || extensionPath;

    const c = merge(defineConfig({
        plugins: [
            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: tag => tag.startsWith('ui-'),
                    },
                },
            }),
        ],
        base: './',
        build: {
            target: 'esnext',
            outDir: 'dist',
            emptyOutDir: true,
            assetsDir: './', // 直接把所有文件都放 dist
            cssCodeSplit: true, // 因为是多个入口，所以 css 也应该独立
            lib: {
                formats: ['cjs'],
            },
            rollupOptions: {
                external: [...builtinModules],
                output: {
                    assetFileNames: '[name].[ext]', // 让 css 文件的命名固定，不要携带 hash
                },
            },
            minify: false,
        },
    }), config);
    return build(c);
}

export function validateProject(projectPath) {

    return new Promise((res, rej) => {
        try {
            const stats = statSync(projectPath);
            if (stats.isDirectory()) {

                const configPath = pathToFileURL(resolve(projectPath, 'hello.build.config.js'));

                if (statSync(configPath).isFile()) {
                    import(configPath).then((module) => {
                        res({
                            project: projectPath,
                            ...module,
                        });
                    });
                } else {
                    rej(new Error('插件构建配置文件不存在!'));
                }
            } else {
                rej(new Error('插件目录不存在!'));
            }
        } catch (error) {
            rej(error);
        }
    });
}
