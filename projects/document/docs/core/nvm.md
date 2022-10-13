# 安装 Node 版本控制工具 —— NVM

## 当前问题

> 当前时间节点为 2022.10.12 , node 已经发展到了 node@18.10.0 (想想我们有多希望 cocos 的用户全部升级到最新版)

目前团队成员本地电脑的 node 版本是不统一的，有 node@12，node@14，node@16等，然而 CI 机器又是固定的 node@12，这样会导致如下问题：

- **语法支持不统一**

本地写的 js 语法能被 node@14 支持，但是推到线上进行 CI 环节却报错，因为 CI 机器的 node@12 不支持该语法。
- **阻碍项目升级** 

比如我们希望采用 `mono-repo` 的方式来维护项目，但是它利用了 node@16 以上的 npm 提供的 workspace 能力。

## 解决方案

团队成员的电脑都应该统一使用 nvm 来进行管理 node 的版本，这样我们只需在每个项目的根目录下新建 .nvmrc 文件并声明好当前项目要求的 node 版本即可。

.nvmrc
```
18.10.0
```

当你拉取了最新的代码，在进行任何操作之前，先执行一次 
```
nvm use
```

它就能根据当前项目的 .nvmrc 文件切换到指定的 node 版本。如此并达到了不同项目可以使用不同 node 版本的目的。

## 安装 nvm 

> 在安装 nvm 之前，需要先将本地的 node 卸载，避免一些莫名其妙的问题，让 nvm 完全接管电脑的 node 

- Mac  [nvm](https://github.com/nvm-sh/nvm)
- Windows [nvm-windows](https://github.com/coreybutler/nvm-windows)

不同平台的安装不做赘述，直接按文档安装即可。



## 可能遇到的一些问题

> mac 系统基本一路绿灯


#### Q: 执行 nvm 命令报错
```
exit status 1: You do not have sufficient privilege to perform this operation.
``` 
A：以管理员的身份运行终端工具

#### Q: 执行 nvm use 16 报错
```
node vv16.17.1 (64-bit) is not installed or cannot be found.
```
A:  windows 的 nvm 不支持省略版本号，把命令改成如:  `nvm use 16.17.1` 即可




#### Q: 'tsc' is not recognized as an internal or external command,
A: 当前工作流一些命令是直接使用了全局依赖，比如 typescript ，所以你切换到一个新的 node 版本，由于之前没有全局安装过导致报错。（node@12 下全局安装过 typesscript ,再切换到 node@16 是无法使用的，版本是完全隔离的。）
- 应急处理可以再每个 node 版本都重复安装一下通用包如： typescript 和 gulp 等（不推荐）
- 将使用 tsc 这些命令的地方都改成 npx tsc, 并显示的将所有依赖声明在 package.json 上，例如你使用了 ts，就应该将 typescript 声明在你的 devDependencies 中，在执行完 npm install 之后，再 执行 npx tsc 等命令才能保证不报错。


## 结尾

截止 2022.10.11 ，CI 机器包括 mac 和 windows 已经支持 nvm 切换 node 的能力。

希望大家积极配合，在所有人都完成安装 nvm 之后，编辑器将会对 cocos-eidtor 和 xxx-extension 等仓库进行整合，采用 `mono-repo` 的代码组织方式，这样对启动编辑器的体验将会有很大的提升。

当下，运行编辑器的 `npm install` 困扰了很多同学，在我们使用新的代码组织方式之后，由于项目都在一个仓库，所以切换分支的动作就省略了。再加上 node@7 以上对 workspace的支持，包与包相互之间的引用会更方便，也不会存在比较隐晦的 node_moduels 公用问题。它们都将提升 `npm install` 的用户体检。