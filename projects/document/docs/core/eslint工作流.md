---
sidebarDepth: 3
---

# Eslint 工作流

Eslint是一个非常好的编程辅助工具，格式化了代码，使其看起来工工整整，也规避了一些低端错误，一定程度上也能减少代码量，提升代码质量。

## 配置原则如下

- 不在 webpack 里面配置loader，影响编译性能
- 区分开发环境和正式环境的规则
- 报错在本地，不能等推到线上进行 CI 的时候报错

### 不在 webpack 里面配置loader，影响编译性能

不在 webpack 的配置中加入 eslint 的校验。我们每天的开发中，会经历无数次的 「保存 - 编译」，「保存 - 编译」。如果每次都要多经过一层 eslint 的 loader 是非常浪费的。所以开发中实时校验是交给 VScode 的 Eslint 插件，在每次保存的时候，自动检测并修复(简单的格式错误)。不在 loader 里配置 eslint 还有个好处，当你更新 eslint 配置时，它只会对你当前改动过的文件生效，不会影响到未改动的项目代码，引起不必要的冲突。

:::tip
wabpack 是全量编译，哪怕你改动的只有文件A，都会进行全量编译。如果是 vite 等增量构建的工具可以无视。不过无论如何，都没有把 Eslint 加入构建流程的必要。
:::

### 区分开发环境和正式环境的规则

Eslint 的存在是为了规范编码提升体验，而不是影响心情的。所以在开发环境中，规则应当比较宽松，在线上对应 `error` 的规则，在开发中只是 `warn`，要不然就会出现如下情况： 当你声明了一个变量，但是由于调试代码的时候，把引用这个变量的地方注释掉了，duang，报错了，「你已声明，但是未读取！」。你还得把声明它的地方一起注释掉，才能正常调试（只是其中一个例子）。这样是非常影响开发体验的。所以对于类似规则都有 dev | prod 两个版本。

- dev: 在开发中给出 warn 提示，不影响代码正常编译、调试。
- prod: 对应最标准规范的格式，保证代码严谨性。


### 报错在本地

为了解决在开发的时候是松散的规则，但是线上又是严格的规则，可以做如下配置。

```js
const isProduction = process.env.NODE_ENV === 'production';
module.exports = {
  rules: {
    "vue/no-unused-components": isProduction ? 2 : 0
  }
}
```


```json
{
  "lint-staged": {
    "packages/**/*.{js,vue,ts,tsx}": [
      "NODE_ENV=production eslint --fix --ext .js,.ts,.vue --ignore-path .eslintignore"
    ]
  }
}
```

在进行提交代码前置验证的时候，我们设置 `NODE_ENV=production` ，这样之前编码阶段进行的宽松校验此时都会变成严格校验，把不符合规范的提交排除掉。
避免代码推到线上进入 CI 环节才发现有格式错误需要重新提交，增加 commit 历史，也影响提 PR 的效率。


## 配合 husky 和 lint-staged

[husky](https://www.npmjs.com/package/husky) 是一个处理 Git 钩子的工具，我们能在如 commit 这些动作里加入一些前置处理。比如在 commit 之前进行一次 Eslint 的校验。

[lint-staged](https://www.npmjs.com/package/lint-staged) 能找出我们此次提交改动的代码，只让这些代码进入验证，而不必每次 commit 都进行全量验证。



.husky/pre-commit
```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx lint-staged
```

package.json
```json
{
  "lint-staged": {
    "packages/**/*.{js,vue,ts,tsx}": [
      "NODE_ENV=production eslint --fix --ext .js,.ts,.vue --ignore-path .eslintignore"
    ]
  }
}
```

## 结合 EditorConfig

我们可以通过 eslint 的配置文件来达到项目的`代码校验规则`统一的目的，但是编辑器(vscode)的配置是每个项目成员本地生效的，无法统一配置，于是需要引入[EditorConfig](https://typicode.github.io/husky/#/?id=troubleshoot) 配合 [vscode 插件](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)，确保每个成员在本地编辑的时候格式一致且不会和 eslint 配置冲突。

- editorConfig 统一了编码规则
- eslintConfig 统一了校验规则

配置示例：
.editorconfig
```
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing _whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```


根据以上原则，搭配 husky 等工具，我们能在开发阶段拥有较为流畅的编码体验，在提交代码时又能及时发现问题。是一个比较折中的方案。

## 补充

husky 一般在终端上可以比较顺利的运行，但是编辑器团队大部分同学是使用 Git 图形管理工具，所以可能需要一些额外的配置，[详见](https://typicode.github.io/husky/#/?id=troubleshoot)。
