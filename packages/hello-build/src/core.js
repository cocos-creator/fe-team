
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import { rm, readFile } from 'fs/promises';
import { resolve } from 'path';
import { statSync } from 'fs';

// import { builtinModules } from 'builtin-modules'; 不支持 esm 
const builtinModules = ['fs', 'path'];
const preModules = ['fs-extra'];

export function createViteBuild(root, filename, filepath) {
    // https://vitejs.cn/config/#build-lib
    return build({
        plugins: [
            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: tag => tag.startsWith('ui-'),
                    },
                },
            }),
        ],
        root: root,
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
                external: [...builtinModules, ...preModules],
            },
            minify: false,
        },
    });
}

export async function creatTask(config) {
    const { project: extensionPath, configPath } = config;
    return readFile(configPath, 'utf-8').then(async (data) => {
        const extensionConfig = JSON.parse(data.toString());

        // 手动清空一下 dist
        await rm(resolve(extensionPath, 'dist'), { force: true, recursive: true, maxRetries: 3 });

        // 由于 vite 的 lib 只支持单入口，所以这边需要遍历构建
        const buildEnteries = Object.entries(extensionConfig);
        for (const [filename, filepath] of buildEnteries) {
            await createViteBuild(extensionPath, filename, resolve(extensionPath, filepath));
        }
    });
}

export async function validateProject(projectPath) {

    return new Promise((res, rej) => {
        try {
            const stats = statSync(projectPath);
            if (stats.isDirectory()) {

                const configPath = resolve(projectPath, 'hello.build.config.json');
                const statsConfig = statSync(configPath);

                if (statsConfig.isFile()) {
                    res({
                        project: projectPath,
                        configPath,
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
