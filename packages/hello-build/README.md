# hello-build

## 安装

```
npm i @cocos-fe/hello-build -D
```

## 使用

安装完成后，在控制台输入 hi-cocos 则会显示帮助信息

```
npx hi-cocos
```

### 生成 dts 文件

插件在构建中，需要用到引擎的 dts，我们封装了一个小脚本用来自动生成，你只需要执行

```
npx hi-cocos engine-dts
```

### 开发插件

```
npx hi-cocos dev plugin-name
```

即可开启实时构建，方便开发。

### 构建插件

```
npx hi-cocos build [plugin-name]
```

如果传入第二个参数，则只构建指定的插件，否则将全量构建。

## 默认约定

由于我们的插件项目结构一般都是如下：

```
.
├── README.MD
├── extensions
│   ├── about
│   ├── assets
│   ├── console
│   └── ui-kit
├── package.json
└── tsconfig.json
```

在一个仓库里有多个插件项目，插件项目都归拢在 `extensions` 目录中，而我们执行构建等命令是在项目根目录，所以默认情况下，针对 `dev` 和 `build` ，当你执行

```
npx hi-cocos build console
```

构建命令内部会去 `extensions` 中找寻 `console` 插件。

假如你的项目结构不是这样的，也想构建某个插件，那么你应该 `cd` 到该插件，然后执行

```
npx hi-cocos build .
```

命令中 `.` 代表了当前插件。

## 配置参考

在插件的根目录创建 hello.build.config.js

```js
// for vue2
const { defineConfig } = require('vite');

exports.config = defineConfig({
    build: {
        lib: {
            entry: {
                browser: './source/browser.ts',
                panel: './source/panel.ts',
            },
        },
        outDir: 'dist',
        rollupOptions: {
            external: ['electron', 'vue'], // 可以和编辑器里面的 vue2.7 共用
        },
    },
    framework: 'vue2', // 可以不配置，因为内部默认是 vue2 （编辑器大量插件都是基于 vue2）
});
```

```js
// for vue3
const { defineConfig } = require('vite');

exports.config = defineConfig({
    build: {
        lib: {
            entry: {
                browser: './source/browser.ts',
                panel: './source/panel.ts',
            },
        },
        outDir: 'dist',
        rollupOptions: {
            external: ['electron'],
        },
    },
    framework: 'vue3',
});
```
