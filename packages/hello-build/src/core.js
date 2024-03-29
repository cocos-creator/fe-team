import { build, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vue2 from '@vitejs/plugin-vue2';
import { resolve } from 'path';
import { statSync } from 'fs';
import builtinModules from './utils/builtin-modules.js';
import { merge } from 'webpack-merge';
import { pathToFileURL } from 'node:url';

export function createViteBuild(taskConfig) {
    const { project: extensionPath, config = {} } = taskConfig;
    config.root = config.root || extensionPath;

    // 针对 framework 选择对应的构建插件
    const { framework = 'vue2' } = config;
    const plugins = [];
    switch (framework) {
        case 'vue2':
            plugins.push(
                vue2({
                    template: {
                        compilerOptions: {
                            isCustomElement: (tag) => tag.startsWith('ui-'),
                        },
                    },
                })
            );
            break;
        case 'vue3':
            plugins.push(
                vue({
                    template: {
                        compilerOptions: {
                            isCustomElement: (tag) => tag.startsWith('ui-'),
                        },
                    },
                })
            );
            break;
        default:
            break;
    }

    // 原则上，这些配置应该是由外面传进来，内部不做 default 的配置，已达到灵活的定制需求
    // 但是我们业务形态比较固定，灵活性 < 简单化
    const c = merge(
        defineConfig({
            plugins: plugins,
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
                    external: [...builtinModules], // 由于是 electron 应用 会用到 node 模块，需要排除
                    output: {
                        assetFileNames: '[name].[ext]', // 让 css 文件的命名固定，不要携带 hash
                    },
                },
                minify: false,
            },
        }),
        config
    );
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
