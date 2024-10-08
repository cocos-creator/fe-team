# @cocos-fe/vite-plugin-cocos-panel

一个专为 vite 构建 cocos 面板的插件，它能将每个面板用到的 css 收集，并在输出构建文件的时候，将收集到的 css 塞入 panel 的 style 属性中。

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
