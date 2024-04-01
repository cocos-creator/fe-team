# 编辑器插件构建

## 背景

编辑器是由不同的插件组成的，你看到的每个模块都是一个插件，有的插件有面板（可以多个），有的插件是纯逻辑，所以我们在编译插件的代码时就要考虑 html + css + js 混杂的情况。

旧的构建方案是用 tsc 和 LESS 来分别构建 .ts 和 .less 文件，所以会有如下方式的构建配置：

```js
// 需要编译的 ts 文件夹
exports.tsc = function () {
    return ['./'];
};

// 需要编译的 less 文件夹
exports.lessc = function () {
    return [
        {
            source: './static/style/index.less',
            dist: './dist/index.css',
        },
        {
            source: './static/style/left.less',
            dist: './dist/left.css',
        },
    ];
};
```

这样构建思路有如下几个弊端：

-   你需要保持 js 、css 的文件层级结构的关系，否则会有文件引用错误的问题
-   你的构建配置和 package.json 里声明的入口不是一一对应的
-   不能使用 .vue 单文件开发，必须将 vue 组件分散成多个文件 [css, js, html]，不利于代码维护和阅读。

## 新的构建思路

当前插件系统设计，每个插件的面板配置和拓展配置都是在 package.json 里声明的，如下：

```json
{
    "name": "console",
    "version": "1.0.0",
    "description": "i18n:console.description",
    "main": "./dist/browser.js", // 主程序

    "panels": {
        "default": {
            "main": "./dist/panel.js" // 面板
        }
    },

    "contributions": {
        "footer": {
            "left": "./dist/footer/left.js", // 拓展
            "right": "./dist/footer/right.js" // 拓展
        }
    }
}
```

在示例的 packag.json 里，总共声明了 4 个入口文件，分别是：

-   main
-   panels.default.main
-   contributions.footer.left
-   contributions.footer.right

所以我们打包应该是只要声明这 4 个入口文件就好，相当于一个库模式有 4 个入口供用户加载。

为了能使用 vue 的单文件开发，所以我选择了 [vite](https://vitejs.cn/)，因为它同时支持单文件解析和库模式的打包。

## 配置参考

在插件的根目录创建 hello.build.config.cjs

```js
const { defineConfig } = require('@cocos-fe/hello-build');

exports.config = defineConfig({
    build: {
        lib: {
            entry: {
                main: './source/main.ts',
                panel: './source/panel.ts',
                left: './source/left.ts',
                right: './source/right.ts',
            },
        },
        outDir: 'dist',
        rollupOptions: {},
    },
    framework: 'vue2', // 可以不配置，因为内部默认是 vue2 （编辑器大量插件都是基于 vue2）
});
```

我们只要列出主入口文件就好，由于 lib 的打包方式会自己收集依赖项，所以无需在配置文件里体现其他被引用的文件。

如果你使用的是编辑器现有的构建工作流，那么需要如下的配置: .workflow.build.js

```js
const { config } = require('./hello.build.config.cjs');

// 我们已经在编辑器的 workflow 中 注册好 vue 的 task 了。
exports.vue = function () {
    return config;
};

exports.npm = function () {
    // other task
};
```

原则上在使用现有的 workflow 流程时，可以不需要 `hello.build.config.cjs` 文件，但是我依然推荐你保留它并且将配置写在该文件，在 `.workflow.build.js` 导入使用即可。

因为这样你依然可以在开发阶段，使用 `hi-cocos dev .` 来监听文件变化且实时构建。

## 模版范例

由于我们的 panel 面板有固定的格式如下：

```js
export const template = '<div id="app"> ...other more html </div>';

export const style = '<style> #app {...other more css} </style>';

export const $ = { root: '#app' };

export function update() {}

export function ready() {}

export function close() {}
```

所以在进行 vue 单文件开发时，可以用下面推荐的模板：

```js
import { join } from 'path';
import { readFileSync } from 'fs';
import { createApp } from 'vue';
import App from 'path/to/app.vue';

const weakMap = new WeakMap();

export const template = '<div id="app"></div>'; // 只留一个 div 用于 vue 的 mount

export const style = readFileSync(join(__dirname, './panel.css'), 'utf8'); // 直接读取 vite 构建剥离出的 css 文件

export const $ = { root: '#app' };

export function ready() {
    const panel = this;
    // 直接渲染 vue 文件，在 App.vue 里面就可以进行规范的 vue 开发。
    const app = createApp(App, { ...rootProps });
    app.mount(panel.$.root);
    weakMap.set(this, app);
}

export function close() {
    const app = weakMap.get(this);
    app?.unmount?.();
}
```

用这样的方式来开发面板，你可以在 app.vue 里进行完备的 vue 开发。

## 使用教程

我们将构建脚本发布成了 npm 包，详细使用方式请看[文档](https://www.npmjs.com/package/@cocos-fe/hello-build)。

:::tip
由于构建脚本只对内提供，所以我们遵循约定大于配置的原则。比如默认原文件要放置在 `source` 文件夹，所有插件都在 `extensions` 目录下等。
:::

## 常见问题

### require 的代码不能被打包

我们的构建使用 vite，vite 内部使用的是 rollup，它是一个 ESM 规范的打包工具，所以默认不支持 commonjs。如果一定要用需要如下 2 个插件来支持：

-   @rollup/plugin-commonjs
-   @rollup/plugin-node-resolve

配置如下：

```js
import { defineConfig } from 'vite';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export const config = defineConfig({
    build: {
        lib: {
            entry: {
                browser: './source/browser.js',
                panel: './source/panel.js',
            },
        },
        rollupOptions: {
            external: ['electron'],
        },
    },
    plugins: [nodeResolve(), commonjs()],
});
```

注意，此时你的业务代码就只能使用 commonjs 的方式来写，不能和 ESM 混用，会导致构建失败。

ps: 都 2024 年了，还是迁移到标准的 ESM 规范来吧！
