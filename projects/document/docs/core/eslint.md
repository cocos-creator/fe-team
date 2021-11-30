---
sidebarDepth: 3
---

# Eslint 配置 

我们在 `@cocos-fe/eslint-config` 中维护了统一的配置文件。并且提供了两种引用方式。

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