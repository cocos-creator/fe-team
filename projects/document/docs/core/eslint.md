---
sidebarDepth: 3
---

# Eslint 配置 

我们在 [@cocos-fe/eslint-config](https://www.npmjs.com/package/@cocos-fe/eslint-config) 中维护了统一的配置文件。
## 安装
```base
npm install @cocos-fe/eslint-config --save-dev
```

## 使用

出于约束规范 & 保持配置灵活性的原则，我们的公共配置里只包含了 `extends` 和 `rules` 两个配置，其他包括 `parser` 、 `plugins` 等一律由具体项目自行配置。

 针对引擎项目和编辑器项目分别暴露了独立的拓展配置：

### 引擎项目

```js{9}
module.exports = {
  "root": true,
  "parser": '@typescript-eslint/parser',
  "plugins": [
    '@typescript-eslint',
  ],
  "extends": [
    'plugin:@typescript-eslint/recommended',
    "@cocos-fe/eslint-config/engine",
  ],
};
```

### 编辑器项目

```js{9}
module.exports = {
  "root": true,
  "parser": '@typescript-eslint/parser',
  "plugins": [
    '@typescript-eslint',
  ],
  "extends": [
    'plugin:@typescript-eslint/recommended',
    "@cocos-fe/eslint-config/editor",
  ],
};
```

### 编辑器甜点包

由于编辑器项目会使用到 `vue` 这类非常规后缀的文件，配置上稍显麻烦，所以我们提供了一份完备的针对 `vue3` 的拓展配置如下:

```js {6,12-14, 16, 18}
module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "es2021": true,
    'vue/setup-compiler-macros': true
  },
  "globals": {
    "Editor": "readonly"
  },
  "extends": [
    "plugin:vue/vue3-recommended",
    'plugin:@typescript-eslint/recommended',
    "./extend-editor.js"
  ],
  "parser": "vue-eslint-parser",
  "parserOptions": {
    parser: "@typescript-eslint/parser",
    ecmaVersion: "latest",
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  "plugins": [
    "vue",
    "@typescript-eslint"
  ]
};

```

所以编辑器项目如果不想自己做这些繁琐的配置，可以直接按照如下引入：


```js {4}
module.exports = {
  "root": true,
  "extends": [
    "@cocos-fe/eslint-config"
  ],
};
```

## 规则定制哲学

定制团队的公共规范，并不是需要我们从头到位定制一份长长的 `rules`，我们需要的是一份`标准规范`，且一起遵守它。（定制规范不是我们的核心业务，大可不必浪费时间）

所以我们公共配置的原则就是统一引入业界的标准规范，并根据实际情况做一些规则复写。

所以我们的规则如下：

- 引入 Eslint 官方推荐的规则
- 引入 Vue 官方推荐的规则
- 引入 Ts官方推荐规则 
- 维护一份少量的自有规则，以达到我们的特殊目的


```js
module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    'plugin:@typescript-eslint/recommended',
  ],
  "rules": {
    // 额外定制一丢丢规则s sss
  }
}
```

仅此而已！