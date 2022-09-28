
import { createServer, build, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { statSync } from 'fs';
import builtinModules from './builtin-modules.js';
import { merge } from 'webpack-merge';

const defaultOptions = defineConfig({
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
        // lib: {
        //     entry: filepath,
        //     formats: ['cjs'],
        //     fileName: () => `${filename}.js`,
        // },
        rollupOptions: {
            // input: inputs,
            external: [...builtinModules],
            output: {
                format: 'cjs',
                entryFileNames: '[name].js',
                assetFileNames: '[name].[ext]', // 让 css 文件的命名固定，不要携带 hash
            },
        },
        minify: false,
    },
});

export function viteBuild(config) {
    const c = merge(defaultOptions, config);
    return build(c);
}

// TODO: 还没处理好
export async function viteDev(config) {
    const c = merge(defaultOptions, defineConfig({
        configFile: false,
        server: {
            open: false,
            port: 1337,
        },
    }), config);

    const server = await createServer(c);
    await server.listen();

    server.printUrls();
}

export async function creatTask(taskConfig, isDev = false) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (res) => {
        const { project: projectPath, config = {} } = taskConfig;
        // root 处理
        config.root = config.root || projectPath;

        // 处理一下入口文件的地址
        const entries = config.build.rollupOptions.input;

        Object.keys(entries).forEach(key => {
            entries[key] = resolve(projectPath, entries[key]);
        });

        if (isDev) {
            await viteDev(config);
        } else {
            await viteBuild(config);
        }
        res();
    });
}

export async function validateProject(projectPath) {

    return new Promise((res, rej) => {
        try {
            const stats = statSync(projectPath);
            if (stats.isDirectory()) {

                const configPath = resolve(projectPath, 'hello.build.config.js');

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
