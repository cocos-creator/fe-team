# hello-build

## 安装

```
npm i @cocos-fe/hello-build -D
```

## 功能

可以通过帮助信息查看提供的功能和具体用法。

```
hi-cocos -h
```

### 生成 dts 文件

插件在构建中，需要用到引擎的 dts，我们封装了一个小脚本用来自动生成，你只需要执行

```
hi-cocos engine-dts
```

### 开发插件

创建 `hello.build.config.mjs` 或者 `hello.build.config.cjs` 配置文件。

_优先使用 .mjs 的配置文件，.cjs 是为了配合编辑器现有的 workflow 而存在的，后期可能删除_

**hello.build.config.mjs**

```js
import { defineConfig } from '@cocos-fe/hello-build'; // 其实是 从 vite 导出的，为了外面减少安装 vite，直接从内部导出

export const config = defineConfig({
    build: {
        lib: {
            entry: {
                browser: './source/browser.ts',
                panel: './source/panel.ts',
            },
        },
        outDir: 'dist',
    },
    framework: 'vue2', // 可省略，默认值
});
```

**hello.build.config.cjs**

```js
const { defineConfig } = require('@cocos-fe/hello-build');

exports.config = defineConfig({
    build: {
        lib: {
            entry: {
                browser: './source/browser.ts',
                panel: './source/panel.ts',
            },
        },
        outDir: 'dist',
        rollupOptions: {},
    },
    framework: 'vue3', // 必须声明
});
```

```
hi-cocos dev plugin-name
```

即可开启实时构建，方便开发。

### 构建插件

```
hi-cocos build [plugin-name]
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
hi-cocos build console
```

构建命令内部会去 `extensions` 中找寻 `console` 插件。

假如你的项目结构不是这样的，也想构建某个插件，那么你应该 `cd` 到该插件，然后执行

```
hi-cocos build .
```

命令中 `.` 代表了当前插件。

## 问题

如果报错 bin 文件没有执行权限，可以

```sh
chmod 777 path/to/node_modules/.bin/hi-cocos
```

## TODO

当前为了兼容编辑器工作流的 CJS 导入方式，做了一些牺牲。如果后期工作流支持 ESM 之后，需要做如下工作：

-   升级 rollup 到 4.x 或者 最新
-   升级 rollup-plugin-node-externals 到 7.x 或者最新
-   删除 rollup-plugin-preserve-shebangs

具体原因：因为 rollup-plugin-node-externals 从 v6 开始就只提供 esm 的导出方式，所以不得不降低版本到 v5，而 v5 最高只兼容 rollup 的 v3，于是只能将 rollup 从 v4 降低到 v3

而 rollup 从 v4 才开始支持 [# 开头的声明语句](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#400) ，降级到 v3 之后导致需要多安装一个 rollup-plugin-preserve-shebangs 包。

以上。

a few minutes later

fuck!!!!

rollup-plugin-node-externals@5 在配合 vite 的 config 时不生效。[v7](https://www.npmjs.com/package/rollup-plugin-node-externals/v/7.1.1) 开始才支持 vite 和 rollup 2 个插件机制。 如果要排除 node 内置模块，需要使用之前的 https://www.npmjs.com/package/builtin-modules 。

毁灭吧！！！

a few minutes later

那么是否意味着，如果我只提供 esm 的包，我已经可以抛弃 rollup 了。目前用 rollup 打包 hello-build 只是为了 esm 和 cjs 两种格式的输出。

就这么干！！

版本以 1.0.0 开始的只提供 esm 版本，且该包的构建剥离 rollup ，直接源码发布。

为了防止后续必须提供 cjs 的版本，我们将继续 从 0.0.19 开始提供。 在 hello_build_cjs 这个分支进行发布。
