import { build, defineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vue2 from '@vitejs/plugin-vue2';
import { resolve } from 'path';
import { statSync, existsSync } from 'fs';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { pathToFileURL } from 'node:url';

export { defineConfig } from 'vite';

export function createViteBuild(taskConfig) {
    const { project: extensionPath, config = {} } = taskConfig;
    config.root = config.root || extensionPath;

    const { framework = 'vue2' } = config;
    // 现状导致: 编辑器内置了 vue@2，所以如果是 vue@2 则可以排除 vue 的打包
    // 如果该插件使用的是 vue@3 ，则需要明确声明不能排除，需要将 vue 一起打包到构建产物去
    const excludes = framework === 'vue3' ? ['vue'] : [];
    const plugins = [
        // 我们发布插件是跟随编辑器一起打包的，不会删除 node_modules ，所以在打包的时候，不要把依赖捆绑进去
        nodeExternals({
            builtins: true, // 排除 node 的内置模块
            deps: true,
            devDeps: true,
            peerDeps: true,
            optDeps: true,
            exclude: [...excludes],
        }),
    ];
    // 针对 framework 选择对应的构建插件
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
    const c = mergeConfig(
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
                    external: [],
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
                const configFilePathEsm = resolve(projectPath, 'hello.build.config.mjs');
                const configFilePathCjs = resolve(projectPath, 'hello.build.config.cjs');
                const configFilePath = existsSync(configFilePathEsm) ? configFilePathEsm : configFilePathCjs;

                if (existsSync(configFilePath)) {
                    const configPath = pathToFileURL(configFilePath);
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
