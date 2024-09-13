import { build, defineConfig, mergeConfig } from 'vite';
import { resolve } from 'node:path';
import { statSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export { defineConfig } from 'vite';

export function createViteBuild(taskConfig) {
    const { project: extensionPath, config = {} } = taskConfig;
    config.root = config.root || extensionPath;

    // 原则上，这些配置应该是由外面传进来，内部不做 default 的配置，以达到灵活的定制需求
    // 但是我们业务形态比较固定，灵活性 < 简单化
    const c = mergeConfig(
        defineConfig({
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
