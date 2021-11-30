---
sidebarDepth: 3
---

# Eslint 配置 

我们在 [@cocos-fe/eslint-config](https://www.npmjs.com/package/@cocos-fe/eslint-config) 中维护了统一的配置文件。并且提供了两种引用方式。

## 安装
```base
npm install @cocos-fe/eslint-config --save-dev
```

## 使用

### 只引用规则

如果你对 `eslint` 比较了解，且希望自己定制配置文件，那么你可以只引用通用的规则

```js{15}
module.exports = {
  "root": true,
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
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@cocos-fe/eslint-config/base", // 只引用了规则
  ],
  "parser": "vue-eslint-parser",
  "parserOptions": {
    ecmaVersion: "latest",
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  "plugins": [
    "vue"
  ],
  "rules": {
  }
};
```

### 全量引用

推荐的方式，这样所有配置项都由基建团队统一提供，更好的统一治理，且其他成员无需了解 `eslint` 的配置。
```js{4}
module.exports = {
  "root": true,
  "extends": [
    "@cocos-fe/eslint-config"
  ],
  "rules": {
  }
};
```

## 规则定制哲学

定制团队的公共规范，并不是需要我们从头到位定制一份长长的 `rules`，我们需要的是一份`标准规范`，且一起遵守它。（定制规范不是我们的核心业务，大可不必浪费时间）

所以我们公共配置的原则就是统一引入业界的标准规范，并根据实际情况做一些规则复写。

所以我们的规则如下：

- 引入 Eslint 官方推荐的规则
- 引入 Vue 官方推荐的规则
- 维护一份少量的自有规则，以达到我们的特殊目的


```js
module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@cocos-fe/eslint-config/base"
  ],
}
```

仅此而已！