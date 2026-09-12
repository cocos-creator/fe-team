# iconfont 项目图标分组

在 iconfont 项目详情页按 `project_icon_name` 第一段分组展示图标。

## 需求

项目图标多了之后平铺难找，需要按命名前缀（如 `菜单-首页-默认` → `菜单`）分组展示。

## 技术实现

### 数据

调 iconfont 项目详情接口 `/api/project/detail.json?pid=xxx`。content script 与页面同域，自动带登录 cookie，无需额外鉴权。

### 分组

按 `project_icon_name` 第一段分组。**组间**：未分组排最后，其余按中文排序。**组内**：跟随 iconfont 当前排序（切排序方式时自动对齐）。

### DOM

不销毁重建，`appendChild` 移动原 `li`，保留页面自带的点击复制等交互。每组前插一个 `div` 标题（`grid-column: 1 / -1` 独占一行）。

### 开关

按钮插入到 `.project-manage-bar` 的"上传图标至项目"后。状态存 `chrome.storage.sync` 跨项目共享。

### SPA 适配

iconfont 是 SPA，切换项目/排序时**不会刷新页面**。用 `MutationObserver` 监听 `.project-manage-bar` 的父元素，在回调里：

1. 主动从 URL 读 `projectId`，变了就更新内部 `currentPid`
2. 按钮丢失 → 重建
3. 分组丢失（标题不存在 / `data-pid` 不匹配）→ 重新拉数据应用
4. li 顺序变了（iconfont 自己重排）→ 重新应用，让组内顺序跟随

## 关键决策记录

### 为什么不用 `pushState` hook

Content script 跑在 Chrome 隔离世界，`window.history` 是代理对象。iconfont 内部用的导航方式（React Router 之类）不会触发 content script hook 的版本。不可靠，废弃。

### 为什么用 `data-pid` 而不是"标题是否存在"

切换项目时 iconfont 只更新 `li` 不重渲染整个 `ul`，老项目的标题会残留。仅靠"标题存在"会误判为"已分组"。给标题打 `data-pid`，校验与当前 URL pid 是否一致，是跨项目识别的可靠依据。

### 为什么 `findIconList` 不兜底

页面除了项目列表，购物车等区域也是 `ul.block-icon-list`。早期版本兜底"找第一个有 li 的"会在新项目加载中误选中购物车，把标题插错地方。收紧为只接受 `.project-iconlist ul.block-icon-list`，宁可返回 null。

### 为什么 `applyGroup` 要校验 `requestPid !== currentPid`

`fetchProjectDetail` 是 async，等待期间用户可能又切换了项目。返回时校验请求时的 pid 与当前 pid 是否一致，不一致丢弃数据，避免竞态污染。

### 为什么组内顺序要跟当前 DOM

用户切 iconfont 的排序方式（按时间/按名称）时，期望组内顺序也对齐。做法：分组时不按接口返回顺序，而是按当前 ul 里 li 的 DOM 顺序把 li 分进组。这样 iconfont 怎么排，组内就怎么排。

### 为什么需要 `lastAppliedLiIds`

切排序时 iconfont 只重排 `li`，不换 `ul` 也不动标题。仅靠"标题在 + pid 对"判断不出排序变了。记录上次分组后的 li id 顺序，observer 对比当前顺序，不一致就重新分组。

### 为什么 `ensureBtn` 内部还要起临时 bodyObserver

首次进入页面时 bar 可能还没渲染，`createBtn` 会失败。此时 `observeBar` 也没法启动（监听不到不存在的元素）。所以在 `ensureBtn` 里起一个 10s 超时的临时 observer 兜底，按钮创建成功即断开。
