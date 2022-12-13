## npm config

由于我们用了 workspace ，所以在发布某个包的时候可以

```
npm publish -w @cocos-fe/eslint-config
```

## TODO
- [ ] 下次记得验证 package.json 的 publishConfig.registry 是否生效（cd 到eslint-config去publish看看）

因为多仓的目录结构，我们是把 .npmrc 放在仓库根目录，如果你 cd 到具体的 package 去执行 npm publish 那么它将不会命中该 .npmrc 文件。和 .eslintrc.js 的逐级递归寻找不同。

但是使用了 workspace 的项目，是支持找到仓库根目录的

npm config 的获取路径优先级为：
- "cli" config from command line options
- "project" config from your project root （也是你执行 npm 命令的 cwd ）
- "user" config from /Users/alan/.npmrc

可以通过 npm config ls -i 查看具体配置

将需要发包package 重新设置 registry， 因为 install 和 publish 走得是同一个配置

