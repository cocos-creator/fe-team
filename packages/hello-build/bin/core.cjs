'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vite = require('vite');
var vue = require('@vitejs/plugin-vue');
var promises = require('node:fs/promises');
var node_path = require('node:path');
var node_fs = require('node:fs');
var webpackMerge = require('webpack-merge');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var vue__default = /*#__PURE__*/_interopDefaultLegacy(vue);

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

    const c = webpackMerge.merge({
        plugins: [
            vue__default["default"]({
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
    return vite.build(c);
}

async function creatTask(taskConfig) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (res) => {
        const { project: extensionPath, config = {}, libs } = taskConfig;

        if (!libs) res();

        // 手动清空一下 dist
        await promises.rm(node_path.resolve(extensionPath, config.dist ?? 'dist'), { force: true, recursive: true, maxRetries: 3 });

        // root 处理
        config.root = config.root ?? extensionPath;

        // 由于 vite 的 lib 只支持单入口，所以这边需要遍历构建
        const buildEnteries = Object.entries(libs);
        for (const [filename, filepath] of buildEnteries) {
            await createViteBuild(filename, node_path.resolve(extensionPath, filepath), config);
        }
        res();
    });
}

async function validateProject(projectPath) {

    return new Promise((res, rej) => {
        try {
            const stats = node_fs.statSync(projectPath);
            if (stats.isDirectory()) {

                const configPath = node_path.resolve(projectPath, 'hello.build.config.js');

                if (node_fs.statSync(configPath).isFile()) {
                    (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })(configPath).then((module) => {
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

exports.creatTask = creatTask;
exports.createViteBuild = createViteBuild;
exports.validateProject = validateProject;
