# @cocos-fe/vite-plugin-cocos-panel

一个专为 vite 构建 [cocos creator 面板](https://docs.cocos.com/creator/3.8/manual/zh/editor/extension/readme.html) 的插件。

你可以通过我们的 [CLI](https://www.npmjs.com/package/create-cocos-plugin) 工具快速创建一个插件模板来体验。

```sh
npm create cocos-plugin@latest
```

## 功能

- 自动收集当前插件面板需要的 css 并将其注入到插件面板的构建产物中。
- 监听文件变化，自动刷新编辑器拓展面板。

## 用法

```js
import { defineConfig } from 'vite';
import { cocosPanelConfig, cocosPanel } from '@cocos-fe/vite-plugin-cocos-panel';

export default defineConfig(({ mode }) => {
    return {
        build: {
            lib: {
                entry: {
                    browser: './src/browser/index.js',
                    panel: './src/panels/panel.js',
                },
                formats: ['cjs'],
                fileName: (format, entryName) => `${entryName}.cjs`,
            },
        },
        plugins: [
            cocosPanelConfig(), // 调整配置文件
            cocosPanel({
                transform: (css) => {
                    // 如果使用了 element-plus 等 UI 库，需要做些 css 的转换工作
                    // element-plus 的全局变量是作用在 :root , 需要改成 :host
                    // 黑暗模式它是在 html 添加 dark 类名，我们应该在最外层的 #app 添加 class="dark"
                    return css.replace(/:root|html\.dark/g, (match) => {
                        return match === ':root' ? ':host' : '#app.dark';
                    });
                },
            }),
        ],
    };
});
```

## 效果

假设如下的源码，我们在面板的入口文件里导入了 `css`，注意是直接通过 `import` 导入的，属于现代前端工程的常规用法。

你甚至可以在 `vue` 文件里直接书写样式。

而此时我们的 `Editor.Panel.define` 里面并没有 `style` 属性。

```ts
import './style.css';

export default Editor.Panel.define({
    template: '<div id="app"></div>',
    $: {
        root: '#app',
    },
    ready() {},
    close() {},
});
```

在构建出的 js 中，我们动态创建了 style 属性，并将所有 css 都赋值给 style 属性。

```js
'use strict';
const panel = Editor.Panel.define({
    template: '<div id="app"></div>',
    $: {
        root: '#app',
    },
    ready() {},
    close() {},
    style: /* css */ `
        body {
            font-size: 12px;
        }
    `,
});
module.exports = panel;
```

## 注意事项

插件内部是通过查找 `Editor.Panel.define` 来判断当前的 js 文件是否为一个 `panle`，所以请确保你的 `panle` 里面有且只有一个 `Editor.Panel.define`。

通常情况下，你的 `panle` 长成这样：

```js
export default Editor.Panel.define({
    template: '<div id="app"></div>',
    $: {
        root: '#app',
    },
    ready() {},
    close() {},
});
```
