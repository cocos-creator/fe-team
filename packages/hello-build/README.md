# hello-build

## 安装

```
npm i @cocos-fe/hello-build -D
```

这是一个纯 ESM 导出的包。不支持 cjs， 如果你需要支持 cjs，那请安装 [0.0.x](https://www.npmjs.com/package/@cocos-fe/hello-build/v/0.0.20) 的版本。

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

## 问答

**Q: 为什么要提供 0.0.x 和 1.x.x 两个版本分支？**
**A:** 因为编辑器当前的工作流必须使用 cjs，而 cjs 在我看来并不值得长期投入。所以主要精力会放在面向标准和未来的 ESM 版本上。

在提供 CJS 和 ESM 上会有较大的依赖差异，原因如下：

#### 关于 rollup 的依赖

esm 可以不需要依赖 rollup，直接源码发布，而 cjs 的需要依赖 rollup 来同时构建 2 个格式的产物。

#### rollup-plugin-node-externals@7 不支持 cjs

[rollup-plugin-node-externals@7](https://www.npmjs.com/package/rollup-plugin-node-externals/v/7.1.1) 开始支持 vite 插件规范，所以 esm 的版本可以利用它智能的排除 node_modules 的依赖，但是它从 v6 开始就只提供纯 esm 的格式了。所以 cjs 不能使用。而 cjs 目前依然通过使用 [builtin-modules](https://www.npmjs.com/package/builtin-modules) 来排除 node 的内置模块，至于 node_modules 的依赖还是手动声明。

#### bin 文件的声明语句

[rollup-plugin-preserve-shebangs](https://www.npmjs.com/package/rollup-plugin-preserve-shebangs) 是一个构建 bin 脚本的插件，而 rollup@4 之后已经[默认支持](https://github.com/rollup/rollup/blob/master/CHANGELOG.md#400)。（ps: 我实际验证 3.29.4 也支持）

综合以上原因，打算对于 cjs 的兼容在 0.0.x 上维护。

而纯 esm 的维护直接从 1.x.x. 开始。

## 创建 .icns 文件

```sh
npx hi-cocos-icns [logo.png]
```
