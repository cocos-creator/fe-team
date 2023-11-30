# Dashboard 2.1 重构计划

## 当前的问题

Dashboard 从最初版本到现在（2023-09-06）已经迭代了4年，期间经历多个开发人员的交替维护，目前的代码架构已经到了很难维护的地步。

###  主进程渲染进程代码混用

这是最棘手的问题，一个 xx.ts ，会在主进程的代码里被 import ，也会被渲染进程的代码里 import，然后在 xx.ts 里通过 isBrowser 来判断执行环境，代码边界不清晰，也会莫名其妙的执行了多余的代码。

下面贴一份比较有代表性的伪代码：

```ts
import { a } from 'moduleA';
import { b } from 'moduleB';
import { c } from 'moduleC';

const e = '一些变量'；
const f = '一些变量'；

/**
 * 查询所有的项目列表
 */
export async function queryAll(): Promise<ProjectInfo[]> {
    if (!isBrowser) {
        return new Promise((resolve) => {
            ipc.send('lib-project:query').callback((err, result) => {
                resolve(result);
            });
        });
    }
    // 执行获取项目列表的逻辑
}


if(isBrowser) {
   ipc.on('lib-project:query', async (event) => {
        const infos = await queryAll();
        event.reply(null, infos);
    });
}
```
这么做的目的很明确，是希望该代码可以在主进程和渲染进程都直接 import 来使用.
```ts
// browser
import { queryAll } from 'xx.ts'

// render
import { queryAll } from 'xx.ts'
```
这种抹平了边界感的代码其实带来了更大的问题，首先，很明显该 xx.ts 本职上是服务主进程的，毕竟这些数据只能在主进程产生和处理，但是为了 “方便” 渲染进程直接调用，而包装了“语法糖”。 当渲染进程直接以 import 的方式调用时，该文件是有多余的代码被执行到的，而且渲染进程也不能随意 import 任何函数，只有该函数内部有类似的代码，它才能转发到主进程去执行。
```ts
if (!isBrowser) {
        return new Promise((resolve) => {
            ipc.send('lib-project:query').callback((err, result) => {
                resolve(result);
            });
        });
    }
```

这无疑在代码组织和使用上产生很大的混乱。

这样的包装方式，只有当一个开发者需要对外提供一个 npm包，才勉强合理。

比如你需要提供一个 @editor/user 的包，你希望使用方可以是主进程，也可以是渲染进程，你保证提供的接口都是一致的，那么才能这样使用。
```ts
// browser 
import { getUserInfo } from '@editor/user';

// render
import { getUserInfo } from '@editor/user';
```

如果针对主进程和渲染进程暴露的接口是不一致的，那么应该是
```ts
// browser
import { getUserInfo, someApiOnlyInBrowser } from '@editor/user/browser';

// render
import { getUserInfo, someApiOnlyInRender } from '@editor/user/render';
```

其实提供`便利`并不一定都是好事，有时候会增加使用者的心智负担，参考 [vue 取消了 $ref](https://github.com/vuejs/rfcs/discussions/369#discussioncomment-5059028) 的语法糖。英文和我一样差的可以看[这篇文章](https://juejin.cn/post/7206604884057325605)

### 基础设施落后

Dashboard 当前的 electron 版本是 `13.1.4`，内置的 node 版本是  `14.16.0`，而且它们的官方最新版分别是 ： `electron@26.1.0`  `node@20.6.0`，我们已经远远落后于官方的版本。

软件的升级必然带来: `新功能` `性能提升` `问题修复` 和 `新的问题`，但是我们经常因为害怕 `新的问题` 而选择拒绝升级，这是消极的。长远来说对项目也是不利的，只会让债务越垒越高。

比如我们的项目代码里有这么一个函数：
```ts
/**
 * 自定义删除步骤
 * @param {*} file 
 */
async function customRemove(file) {
    try {
        if (process.platform === 'darwin') {
            spawnSync('rm', ['-rf', file]);
        } else {
            spawnSync('del', ['/f', '/a', '/q', file]);
        }
    } catch (error) {
        typeof shell.trashItem === 'function' ? await shell.trashItem(file) : shell.moveItemToTrash(file);
    }
    if (existsSync(file)) {
        typeof shell.trashItem === 'function' ? await shell.trashItem(file) : shell.moveItemToTrash(file);
    }
}
```

想必是当时 Dashobad 还依赖 electron@5.0.8 的时候，开发者发现 shell.moveItemToTrash 有问题，于是自己封装了 customRemove ，后来我们升级到了 electron@14.x，官方已经修复了[该问题](https://github.com/electron/electron/pull/25114)。但是由于当时基于 asar 的更新导致有部分旧的基座还是 electron@5.0.8，于是又加了 
```ts
typeof shell.trashItem === 'function' ? await shell.trashItem(file) : shell.moveItemToTrash(file);
```
 
如果我们都是按规范的方式及时升级项目，那么该函数可以直接删除了，直接使用 `shell.trashItem(file)` 即可。

> 我们也承认对于一个大项目而已，升级是慎重的，特别是 Dashboard 是服务 creator ，而 creator 目前还是 electron@14 ,所以该升级可`从长计议`。

不过我们可以将开发模式的 node 版本升级上来，用于享受 npm@7 开始带来的 workspace 功能。当前新手要介入 Dashboard的开发需要：
- 在 root 执行 npm install
- 在 ./app 里面执行 npm install
- 在 ./cocos 里面执行 npm install 

才能将项目运行起来，如果引入了 workspace 功能，我们只需要在 root 执行一次 npm install 即可。

## 重构计划
由于我们后期还将保留 asar 的更新方式，所以结构上不能有太大的调整。

### 拆分项目
将现有的项目结构拆分成：

- app
- cocos/browser
- cocos/render
- cocos/common (可选)

#### app - 基座
为了保留 asar的更新方式继续可用，继续使用纯 js 实现。（此部分代码几乎不用改动）

#### cocos/browser  主进程
所有主进程代码都集合在这里，废弃 isBrowser 的判断机制，在这个 package 下的所有代码都是主进程代码，渲染进程无法直接通过 import 方式调用，借鉴后端应用的架构，将对外提供的 IPC 作为路由模式提供。
所以主进程对外将只有一个 入口，如： cocos/browser/ipc/index.ts 

另外针对 broadcast 的消息也应该统一写在一个地方配置，其他代码只是调用这份文件，这样可以非常直观的知道，当前应用会对外广播多少事件  cocos/browser/ipc/broadcast.ts 

而且我们应该将大部分业务逻辑都在 Browder 进程实现，将 render 当作一个 轻 web 应用。

#### cocos/render 渲染进程
当作传统的轻web应用，只是拥有一些 node 基础api的 使用权限，将重要的逻辑都交给 browser 

#### cocos/common 公共模块
视情况而定，该模块是为了让 主进程和渲染进程共享代码而存在的，但是如果我们拆分得当，将主要功能都放置在主进程，一般无需增加这个模块。

目前想到需要共用的代码只有一些 ts的类型定义，这个可以通过配置 ts.config.json 来解决。

### 具体执行步骤

- [x] 从线上切出一个 2.1.0 分支，并将当前未合并的 PR 都合入该分支
- [x]  将 dev 模式的 node 升级到 18，使用 npm 的 workspace 功能
- [x]  将工作流中定制 electron 和 asar 的流程移除，直接使用官方的即可
- [x]  将 devDependencies 全部声明在 root/package.json ，这样可以降低 cocos.asar 的包体大小
- [x]  拆分cocos/browser 和 cocos/render 这是最重要且费时的工作
- [x] 收敛全局变量 Dashboard 挂载的接口，和 store 的开发人员确定下，只保留必要的。
- [x] 升级一些依赖如 axios ，之前为了兼容 elecron@5.0.8 ，故意锁了较低的版本。
- [x] 删除之前兼容 elecron@5.0.8 的代码，如 shell.moveItemToTrash(file) （因为现在已经全部都是 elecron@14）
- [ ] @base/xx 等依赖很多是低版本，看是否统一这次做升级
- [ ] 去除 db 特供版 比如："@editor/extension-sdk": "2.0.4-dashboard.5", 这也是之前为了兼容 electron@5.0.8 
- [x] 删除 @electron/remote ，这是[官方不推荐](https://www.npmjs.com/package/@electron/remote )的模块 
- [x] ui-label 的报错处理 Consider using MutationObserver instead. 
- [x] 移除之前windows平台编辑器迁移的代码



### 重构的边界
此次重构只是针对代码组织架构的调整，删除一些废弃代码，不应该深入到业务代码的具体实现。关于具体业务逻辑的梳理应该是在当前 Dashobar@2.1.0 重构完成之后，再进行。可以预先规划大致如下：
- 梳理编辑器的安装流程（下载，解压，卸载）
- 梳理项目的创建流程（下载，解压， 卸载）
- 梳理项目的打开流程 （日志系统，不同 creator 版本的补丁应该以更合理的机制，当前都是if）

 
### 一些背景信息
- 我们能在 cocos/browser 和 cocos/render 里分别去 import @base/electron-base-ipc ，还能实现 ipc 通信是因为 @base/electron-base-ipc 内部是直接使用了全局的 electorn 

## 时间规划

暂定国庆之前完成拆分工作：

- 先将 cocos 拆分成 cocos/browser 和 cocos/render 这是重点也是所有其他需求的前提，暂定一周（5个工作日）09月18日 - 09月22日
-  处理由于代码文件结构变动带来的一系列副作用，比如资源的引用路径，构建的配置等
-  将一些无用的旧代码删除，和旧的兼容方案删除  09月25日 - 09月29日


--------------------------------- 2023.09.28 ----------------------------

## 补充

### 放弃 workspace 
有尝试过 [pnpm](https://www.pnpm.cn/)  和 npm 原生的 workspace，它们都是默认将依赖安装在 root，与我们的预期不符，我们需要 cocos/ 下的所有依赖都在 cocos/ 里，这样通过 asar 更新的时候才能更新依赖。

所以我们做了个取巧，放弃 workspace的功能，将 cocos/browser 和 cocos/render 下的依赖都声明在 cocos/package.json， 也就是主进程和渲染进程代码是分开的 ，但是依赖是共用的。

### @types 共用
主进程中用到的类型，一般在渲染进程也会用到，所以主进程的 @types 直接放在 cocos/@types ，让2个进程都可以使用。

## 结果
重构已经基本结束，虽然没有在功能上修复什么bug，但是主进程和渲染进程的代码已经是安全独立的，后期的维护会轻松很多。接下来就可以进行具体模块的逻辑重构了。


### 包体大小对比
|     版本          |       asar         |      dmg        |
| :-----------: | :-----------: | :-----------: |
|       v2.0         |      94.9M     |    210.3M       |
|       v2.1.0      |      84.3M     |     102.8M      |

包体的减少主要是这次重新梳理了 dependencies ，将 devDependencies 全部挪到 root/package.json 中，不会参与构建。
而且在打包 asar 的时候，有对 node_modules 进行文件剔除，例如 readme.md  types 等文件都被删除了。

