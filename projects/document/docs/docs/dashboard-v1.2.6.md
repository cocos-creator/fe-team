## 一些前提约定
- v1.2.6 热更能力发布之后，我们将在 1.3.x 进行版本迭代，2.x 的版本等 dashboard 下次界面有重大改动再使用

## 关于 v1.2.6 发布热更的版本示意图

v1.2.6 发布之后，用户的基座就具备了全量更新到 1.3.x 的能力，理想状态是 v1.2.6 作为 1.2.x 的最后一个版本，后续都在 1.3.x 继续开发。

但是！！

万一 v1.2.6 发布之后，出现了意外情况，我们也需要具备兜底的能力，需要在 v1.2.6 保留新旧的热更功能。即——— v1.2.6 可以更新到 v1.2.7，也可以更新到 1.3.x。

在 v1.2.6 发布之后
- 顺利：直接进行 1.3.0 的开发，走新的热更流程（旧热更可以废弃）
- 出错：发布 v1.2.7  v1.2.8 v1.2.9 直到解决问题，然后发布 v1.3.0

所以我们并不是 1.2.x 和 1.3.x 共存的关系，而是，1.2.x 发布热更能力直到没有任何问题，再发布 1.3.x。

```mermaid
graph TD
    A[热更流程] --> |electron 5.0.8 & node 12 兼容性| B(v1.0.x) --> X(是否win) --> |yes : visual studio 的兼容问题|I
   
    A --> |electron 13.1.4|H(v1.2.5) --> X --> |no: 直接升级|I([热更版本 v1.2.6])

    I --> J(顺利) --> K(v1.3.0) --> L(进入新时代)
    I --> O(失败) --> P(v1.2.7) --> Q(顺利) --> K
    P --> R(失败) --> S(1.2.8...) -->|终究要进入| K

```

#### 针对 1.2.6 发布失败后，我们发布了 1.2.7，然后又发布了 1.3.0 的情况，我们做了1.3.0的前置条件判断

在请求新版热更接口之前，请求旧版的热更，如果有数据即说明有发布 1.2.7 等，就跳过新热更的逻辑。

## 需要解决的问题

- [x] 实现新的热更
- [x] 升级弹窗共用
- [x] visual studio 的特供版
- [x] 关于 window 的已经下载的编辑器的处理流程
- [x] window上默认下载地址修改到 c:/ProgramData/cocos/editros
- [ ] 程序错误


### 实现新的热更
@yufengctbu 

```mermaid
flowchart TD
    A[获取版本信息]
    A -- 有更新 -->  C(判断是否已下载)
    A -- 无更新 -->  D[结束]
    C -- 已存在 --> G[/比对文件hash/]
    C -- 不存在 --> H[\下载更新包\]
    G -- 匹配 --> E{提示更新}
    G -- 不匹配 --> H
    H  --> E
    E -- 是 -->  F[/关闭更新\]
    E -- 否 --> D
```

### 升级弹窗共用
由于 v1.2.6 同时具备新旧2套热更能力，而我们又希望对于用户而且保留之前的交互体验，所以2套热更的通知弹窗是共用的，这边需要做判断处理。

### visual studio 的特供版
window 系统上，针对 visual studio 的特供版处理。

#### 背景
- visual studio 下载地址是一个特殊包，里面包含了 source: visual studio 的标记
- 微软平台不更新： 用户下载的是旧包，将通过 asar 的更新能力更新到 1.2.6，然后走热更更新到1.3.x
- 微软平台更新： 需要给微软重新打一个 内置 platform.config.json 的附带1.3.x 的热更的包 （频率不高）


#### 流程
```mermaid
graph TD
    A[微软特供版本] -->  B(打多个包) --> X(需要重复测试) --> O(弃用)
    A --> C(共用一个包) -->  D(配置存在应用外面) --> Y(导致下载常规版本变成特供版)--> O(弃用)
    C --> E(配置存在应用内部) -->  |目前只针对windows|F(保存为platform.config.json) -->G(热更系统将这个文件加入白名单)
    
```

#### 具体步骤
- v1.2.6 在 cocos.asar 引入一段脚本，用于将 platform.config.json 写入 const resourcesPath = join(app.getAppPath(), '../');
 ```js
const { join } = require('path');
const { writeFileSync } = require('fs');
const { app } = require('electron');

const resourcesPath = join(app.getAppPath(), '../');

module.exports.start = function(_, options = {}) {
    const source = options.source || 'Cocos';
    writeFileSync(
        join(resourcesPath, 'platform.config.json'),
        JSON.stringify({ source: source }, null, 4)
    );
};
 ```
- v1.3.x 将上面的脚本删除，在 app.asar 引入一个脚本，用于读取 platform.config.json ，组装 COCOS.init 的执行入参
```js
const { app } = require('electron');
const { join } = require('path');
const { readFileSync, existsSync } = require('fs');

const resourcesPath = join(app.getAppPath(), '../');
const jsonPath = join(resourcesPath, 'platform.config.json');

module.exports.get = function() {
    if (existsSync(jsonPath)) {
        try {
            const json = readFileSync(jsonPath, 'utf-8');
            return JSON.parse(json).source;
        } catch (e) {
            return 'Cocos';
        }
    }
    return 'Cocos';
};

```
- 后期如果需要给 windows 打过一个特供包，需要往应用程序里面 塞一个 platform.config.json。

### 关于 window 的已经下载的编辑器的处理流程

***方案一***  🙅 
通过将 .editors 文件夹加入忽略名单，在windows 10 验证可行，但是在 window 11 还是会全量卸载文件夹。虽然可以利用 [ advancedinstll 配置](https://www.advancedinstaller.com/user-guide/folder-removal-dialog.html) 指定只删除非空文件夹。 但是它只针对新发布的基座起作用，假设我们在 1.3.0 通过 advancedinstaller 配置好了，在热更 1.2.6 的时候，是不起作用的。

@yufengctbu  还做了如下尝试：
1、利用advance installer 添加powershell脚本实现
2、利用advance installer 自定义事件实现
3、配置升级前置事件实现
 
***废弃***
```mermaid
graph TD
    A[编辑器存放地址] --> B(没有修改)  --> |热更系统会忽略| X
    A --> C(有修改)
    C -->  D(dashboard 目录外) --> |热更不会覆盖它| X(无需操作)
    C -->  E(dashboard 目录内) --> |极端情况|F(迁移) --> G(提示用户操作) --> Y(不操只是导致重新下载)
    F(迁移) -->  H(自动迁移) --> Z(磁盘速度导致很多临界问题)
```

***方案二***  🙅 
在热更新的时候，对 .editors 文件夹进行移动（比如和应用同级目录），待热更完成，将其移动回来。这样在同一个盘里做移动操作速度是非常快的，但是经过调研，advancedinstaller 在进行程序热更是无法执行其他脚本的 。@yufen 确认。

***方案三***  👍

#### 为保证操作速度和规避容量问题，约定如下：
- 采用移动的方式进行数据迁移
- 不跨盘操作
#### 需要处理的问题
- 1.2.6 需要为存储编辑器预设新的默认地址 programData/cocos/editors or 应用同级目录的/dashboard-editors/

#### 交互
- 每次启动 Dashboard 都弹出提示直到迁移为止
- 全局常驻一个迁移提示
- 有待迁移编辑器的Dashboard不能进行新版的热更


```mermaid
graph TD
    A01[读取 editors.josn]
    A02[读取单一编辑器数据]
    A021[检查是否在 dashbaord 目录内]
    A03[检查文件是否被占用]
    A04[检查进程是否已经开启]
    A05[移动的目标目录是否存在]

    A10[开始迁移]
    A11[判断当前盘符与 programData 是否同盘]
    A12[剪切到 programData]
    A13[剪切到安装目录同级目录]
    A14[剪切结束]
    A141[更新editor.json当前记录 设置软连接]
    A15[循环下一个编辑器]
    A16[开始升级配置]

    A20[检查下载地址是否有修改]
    A21[下载地址是否在编辑器内]
    A23[设置为:c:/ProgramData/cocos/editors]
    A25[告知用户设置的路径不合法 被我们修改为新的默认地址]

    A30[完成迁移]
    A31[结束]

    A90[收集捕获错误]
    A91[弹窗提示错误详细信息]
    A93[是否有收集到错误]

    A01 --> A02 --> A021 -->|是| A03 --> |否| A04 --> |否| A05--> |否| A10 --> A11
    A021 -->|否| A15
    A05 --> |被占用| A90
    A03 -->|被占用| A90
    A04 -->|进程已开启| A90
    A11 -->|是| A12
    A11 -->|否| A13
    A12 --> A14
    A13 --> A14
    A14 -->|成功| A141
    A141 -->|成功| A15 --> A16
    A15 -->|还有其他数据| A02
    A14 -->|失败| A90

    A16 --> A20 -->|是| A21 -->|是| A23 --> A25 --> A91
    A20 -->|否| A30
    A21 --> |否| A30

    A30 --> A93 --> A91 --> A31
```
## window上默认下载地址修改到 c:/ProgramData/cocos/editros

windows 关于数据存放的文件夹有2个：[参考来源](https://www.makeuseof.com/tag/difference-between-appdata-programdata/)
- AppData: 在用户目录下，一般存储针对于当前用户的私有数据
- ProgramData: 在 C 盘下，一般存储所有用户都可以访问的公共数据

同时在setting页面需要对用户设置的下载地址进行验证，不能设置在应用目录内。

### 程序错误

```mermaid
graph TD
    A[DB无法升级] --> B(热更的过程)  -->  X(热更SDK需要兜底) --> Y(https://www.advancedinstaller.com/user-guide/json-file-install.html)
    A --> C(程序可以启动) --> O(我们实现一套通知机制)
```

- 复制一套现有的公告模块，进行 web view的展示
- dashboard 发起请求参数为： dashboard的版本号，平台信息，后端根据这个数据判断是否需要通知用户回退
- 后端实现一个接口，不需要UI界面，逻辑写死，不用数据库。


## 有待验证的

### 关于 generate 环节  asar 的问题

```mermaid
graph TD
    A[generate asar] --> B(windows)  -->  C(creator-asar) --> |旧基座 & 新包|D(失败)
    B --> E(asar) -->|新基座|F(成功)
    E(asar) -->|旧基座|D
    A --> O(mac) --> P(creator-asar) --> |旧基座|Q(成功)
    O --> M(asar) --> |旧基座| N(失败)
```

已经解决： 

原因是我们针对 13.1.4 的electron进行了定制（区分平台 mac & win），它需要配套使用定制的 creator-asar(npm包) 进行打包。


## TODO
- [ ] 应该将所有旧的下载地址重定向到 1.3.x 的最新地址（只要有新版本，都应该更新重定向）
- [ ] 1.3.x 可以规划着把 app 这个底座去除，因为走了规范热更它就没作用了，不应该增加项目复杂度和代码量