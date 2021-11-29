const base = require('./base');

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
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
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
    ...base.rules
  }
};

// "off" or   0 - 关闭规则
// "warn" or  1 - 将规则视为一个警告（不会影响退出码）
// "error" or 2 - 将规则视为一个错误 (退出码为1)

// 取消规则验证
/* eslint-disable no-console */ // 当前文件
/* eslint-disable-next-line */       // 下一行
/* eslint-disable-line no-alert */   // 当前行
