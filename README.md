# cocos-FE

cocos creator FE team [官网](https://cocos-creator.github.io/fe-team/)

由于使用了 npm@7 的 workspace 功能，所以 `node` 版本需要在 16 以上。 推荐使用 `nvm` 来管理 `node` 版本。

## Eslint

[@cocos-fe/eslint-config](https://www.npmjs.com/package/@cocos-fe/eslint-config)

## 构建插件

[@cocos-fe/hello-build](https://www.npmjs.com/package/@cocos-fe/hello-build)

## 创建 creator 插件

[create-cocos-plugin](https://www.npmjs.com/package/create-cocos-plugin)

## 发布包

```bash
 npm config get registry 查看当前是哪个源
```

发布要切换到[官方源](https://registry.npmjs.org)

发布之后在 https://npmmirror.com/ 这里看下是否有被淘宝同步到。

安装要切换到[淘宝源](https://registry.npmmirror.com)，如果淘宝源没有及时更新，可以切到官方源进行下载。
