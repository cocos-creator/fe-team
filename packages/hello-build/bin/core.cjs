'use strict';

var vite = require('vite');
var vue = require('@vitejs/plugin-vue');
var node_path = require('node:path');
var node_fs = require('node:fs');
var webpackMerge = require('webpack-merge');
var node_url = require('node:url');

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

function createViteBuild(taskConfig) {
    const { project: extensionPath, config = {} } = taskConfig;
    config.root = config.root || extensionPath;

    const c = webpackMerge.merge(vite.defineConfig({
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
    return vite.build(c);
}

function validateProject(projectPath) {

    return new Promise((res, rej) => {
        try {
            const stats = node_fs.statSync(projectPath);
            if (stats.isDirectory()) {

                const configPath = node_url.pathToFileURL(node_path.resolve(projectPath, 'hello.build.config.js'));

                if (node_fs.statSync(configPath).isFile()) {
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

exports.createViteBuild = createViteBuild;
exports.validateProject = validateProject;
