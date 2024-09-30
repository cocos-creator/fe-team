import { defineConfig } from 'vite';
import { nodeExternals } from 'rollup-plugin-node-externals';
import react from '@vitejs/plugin-react';
import { cocosPanelConfig, cocosPanelCss } from '@cocos-fe/vite-plugin-cocos-panel';

export default defineConfig(({ mode }) => {
    /**
     *  注意事项:
     *  vite 在构建 lib 模式的时候，是没有 dev 服务的，dev 主要用于 web 应用
     *  所以在 package.json 的 scripts 里 dev 和 build 都是执行 vite build
     *  只是在 dev 的脚本里，手动指定了 "--mode development" https://cn.vitejs.dev/guide/env-and-mode.html
     *  然后在 development 模式下，我们配置 watch 的配置
     */
    const isDev = mode === 'development';

    return {
        build: {
            lib: {
                entry: {
                    browser: './src/browser/index.ts',
                    panel: './src/panels/panel.tsx',
                },
                formats: ['cjs'],
                fileName: (format, entryName) => `${entryName}.${format}`,
            },
            watch: isDev
                ? {
                      include: ['./src/**/*.tsx', './src/**/*.ts', './src/**/*.css'],
                  }
                : null,
            target: 'modules',
            minify: false,
        },
        plugins: [
            react(),
            nodeExternals({
                builtins: true, // 排除 node 的内置模块
                deps: false, // 将依赖打入 dist，发布的时候可以删除 node_modules
                devDeps: true,
                peerDeps: true,
                optDeps: true,
            }),
            cocosPanelConfig(),
            cocosPanelCss(),
        ],
    };
});
