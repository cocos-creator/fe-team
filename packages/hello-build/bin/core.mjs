import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { statSync } from 'node:fs';
import { merge } from 'webpack-merge';
import { pathToFileURL } from 'node:url';

// https://www.npmjs.com/package/builtin-modules 

var builtinModules = [
    'assert',
    'async_hooks',
    'buffer',
    'child_process',
    'cluster',
    'console',
    'constants',
    'crypto',
    'dgram',
    'diagnostics_channel',
    'dns',
    'domain',
    'events',
    'fs',
    'http',
    'http2',
    'https',
    'inspector',
    'module',
    'net',
    'os',
    'path',
    'perf_hooks',
    'process',
    'punycode',
    'querystring',
    'readline',
    'repl',
    'stream',
    'string_decoder',
    'timers',
    'tls',
    'trace_events',
    'tty',
    'url',
    'util',
    'v8',
    'vm',
    'wasi',
    'worker_threads',
    'zlib',
];

function createViteBuild(filename, filepath, config) {
    // https://vitejs.cn/config/#build-lib

    const c = merge({
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
            emptyOutDir: false, // 因为是循环构建，不要删除文件
            assetsDir: './', // 直接把所有文件都放 dist
            cssCodeSplit: true, // 因为是多个入口，所以 css 也应该独立
            lib: {
                entry: filepath,
                formats: ['cjs'],
                fileName: () => `${filename}.js`,
            },
            rollupOptions: {
                external: [...builtinModules],
                output: {
                    assetFileNames: '[name].[ext]', // 让 css 文件的命名固定，不要携带 hash
                },
            },
            minify: false,
        },
    }, config);
    return build(c);
}

async function creatTask(taskConfig) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (res) => {
        const { project: extensionPath, config = {}, libs } = taskConfig;

        if (!libs) res();

        // 手动清空一下 dist
        await rm(resolve(extensionPath, config.dist ?? 'dist'), { force: true, recursive: true, maxRetries: 3 });

        // root 处理
        config.root = config.root ?? extensionPath;

        // 由于 vite 的 lib 只支持单入口，所以这边需要遍历构建
        const buildEnteries = Object.entries(libs);
        for (const [filename, filepath] of buildEnteries) {
            await createViteBuild(filename, resolve(extensionPath, filepath), config);
        }
        res();
    });
}

async function validateProject(projectPath) {

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

export { creatTask, createViteBuild, validateProject };