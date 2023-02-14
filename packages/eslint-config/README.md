# Eslint config


[使用教程](http://cocos.90s.co/core/eslint.html)


## 参考链接

- [node exports](https://nodejs.org/api/packages.html#package-entry-points)
- [eslint](https://eslint.org/)
- [typescritp-eslint](https://typescript-eslint.io/docs/linting/)
- [vue-eslint-parser](https://www.npmjs.com/package/vue-eslint-parser)

## 备忘

**规则值说明**
- "off" or   0 - 关闭规则
- "warn" or  1 - 将规则视为一个警告（不会影响退出码）
- "error" or 2 - 将规则视为一个错误 (退出码为1)

**关闭规则验证**
- 当前文件： /* eslint-disable no-console */
- 下一行：   /* eslint-disable-next-line */
- 当前行：   /* eslint-disable-line no-alert */

如果规则不生效，可以按 cmd + p 唤起功能搜索面板，按 F1，选择 Eslint: restart eslint server。
