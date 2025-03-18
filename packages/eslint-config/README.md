# Eslint 配置

## 安装

```
npm install @cocos-fe/eslint-config --save-dev
```

## 使用

针对引擎项目和编辑器项目分别暴露了独立的拓展配置：

### 引擎项目

```js
import { rulesEngine } from '@cocos-fe/eslint-config';
```

### 编辑器项目

```js
import { rulesEditor } from '@cocos-fe/eslint-config';
```

## 规则定制哲学

定制团队的公共规范，并不是需要我们从头到位定制一份长长的 `rules`，我们需要的是一份`标准规范`，且一起遵守它。（定制规范不是我们的核心业务，大可不必浪费时间）

所以我们公共配置的原则就是统一引入业界的标准规范，并根据实际情况做一些规则复写。

所以我们的规则如下：

-   引入 Eslint 官方推荐的规则
-   引入 Vue 官方推荐的规则
-   引入 Ts 官方推荐规则
-   维护一份少量的自有规则，以达到我们的特殊目的

仅此而已！

## 参考链接

-   [node exports](https://nodejs.org/api/packages.html#package-entry-points)
-   [eslint](https://eslint.org/)
-   [typescritp-eslint](https://typescript-eslint.io/docs/linting/)
-   [vue-eslint-parser](https://www.npmjs.com/package/vue-eslint-parser)

## 备忘

**规则值说明**

-   "off" or 0 - 关闭规则
-   "warn" or 1 - 将规则视为一个警告（不会影响退出码）
-   "error" or 2 - 将规则视为一个错误 (退出码为 1)

**关闭规则验证**

-   当前文件： /_ eslint-disable no-console _/
-   下一行： /_ eslint-disable-next-line _/
-   当前行： /_ eslint-disable-line no-alert _/

如果规则不生效，可以按 cmd + p 唤起功能搜索面板，按 F1，选择 Eslint: restart eslint server。
