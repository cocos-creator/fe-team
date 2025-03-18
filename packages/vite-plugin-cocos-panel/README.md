# @cocos-fe/vite-plugin-cocos-panel

一个专为 vite 构建 cocos 面板的插件，它能将每个面板用到的 css 收集，并在输出构建文件的时候，将收集到的 css 塞入 panel 的 style 属性中。

## 用法

```js
import { defineConfig } from 'vite';
import { cocosPanelConfig, cocosPanelCss } from '@cocos-fe/vite-plugin-cocos-panel';

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
            cocosPanelCss({
                transform: (css) => {
                    // 如果使用了 element-plus 等 UI 库，需要做些 css 的转换工作
                    // element-plus 的全局变量是作用在 :root , 需要改成 :host
                    // 黑暗模式它是在 html 添加 dark 类名，我们应该在最外层的 #app 添加 class="dark"
                    return css.replaceAll(':root', ':host').replaceAll('html.dark', '#app.dark');
                },
            }),
        ],
    };
});
```

## 效果

假设如下的源码，我们在 面板的入口文件里导入了 css

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
