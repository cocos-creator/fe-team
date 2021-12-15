# Github ID 翻译插件

## 背景

公司的项目是在 Github 上维护的，每个成员都使用自己的 Github 账号（非公司统一分配，规范命名）。由于每个成员都很有个性，ID 取的琳瑯满目。要把它们和队员的真名对应起来有点困难。

目前的的方案是公共文档有一份 ID 列表，大家对照表格来识别其他的协作成员。（这一点都不互联网，也不酷）

<img width="600" src="https://user-images.githubusercontent.com/35713518/145004585-e7ed56df-db9e-45c0-810a-267e1732c270.png" />

于是大家觉得需要有个插件来解决这个问题。

<img width="400" src="https://user-images.githubusercontent.com/35713518/145000281-102f1a01-b287-44a0-bf68-cb21d9dbfba7.png" />

## 方案

利用浏览器插件，将页面上的 `Github ID` ，替换成对应成员的中文名。

实现流程：
- 在 Git 仓库里维护 `github-ids.json` ，利用 `workflows` 将文件同步到 oss。
- 浏览器插件从 oss 获取到最新的 `github-ids.json` 列表
- 查看 Github 的页面结构，找出会显示 ID 的 DOM
- 将匹配到的 DOM 的内容，替换成对应的中文名

```js
function replaceIds() {
  const url = `https://90s.oss-cn-hangzhou.aliyuncs.com/github-ids/github-ids.json?v=${Date.now()}`;

  // 获取数据
  fetch(url).then(res => res.json()).then(data => {
    Array.from(document.querySelectorAll('.author, .assignee span, .TimelineItem-body a span'))
      .forEach(ele => {
        const text = ele.innerText;
        const textZH = data[text];
        if (textZH) {
          ele.innerText = textZH;
        }
      })
  })
}
```

效果如下：

<video width="100%" controls src="https://website-cocos-fe.oss-cn-hangzhou.aliyuncs.com/%E5%B1%8F%E5%B9%95%E5%BD%95%E5%88%B62021-12-10%2021.12.50.mov" />

我们替换了页面上原本显示 Github ID 的地方，展示为中文名称。并且在右上角放置了一个 ICON，点击可以展开/关闭一个 ID 列表。

列表支持按中文名搜索 ID，方便 `@` 其他成员。 点击 ID 或者中文名称都可以复制对应内容。

如果远程更新了数据，点击刷新按钮即可同步远程数据。

## 数据维护

我们把数据统一在 [这里](https://github.com/cocos-creator/cocos-fe/blob/main/projects/github-ids/github-ids.json) 维护。如果有更新人员名单，往仓库[cocos-fe](https://github.com/cocos-creator/cocos-fe) 提个 PR 即可。我们的 `workflows` 会触发相应的任务，将最新的 `github-ids.json` 推送到 OSS。

插件那边会获取到最新的数据映射表。通过如下粗暴的方式：

```
const url = `https://90s.oss-cn-hangzhou.aliyuncs.com/github-ids/github-ids.json?v=${Date.now()}`;
```

:::tip
由于人员 ID 列表是一个不经常更新的数据，所以我们默认都是从本地缓存里拿。如果有更新了远程的数据，手动点击一下更新按钮即可。
:::
## 遇到的问题

Github 某些页面是以 SPA 的方式渲染，导致它进行路由切换的时候不会刷新页面，进而不能通过 onload 这样的方式来执行替换 ID 的逻辑。

而如果通过监听 `popstate` 事件，它无法捕获 `history.pushState() | history.replaceState()` ，所以此路不通（可能魔改可以）。

不过我们发现，Github 在路由切换时，有个进度条的呈现，于是我们通过监听这个进度条的 width 变化，如果达到 100% ，说明页面切换成功。

```js
function observerProgress() {
  const $progress = document.querySelector('.Progress-item');
  const callback = function (mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'attributes') {
        if ($progress.style.width === '100%') {
          window.setTimeout(replaceIds, 200);
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe($progress, { attributes: true });
  // observer.disconnect();
}
```

## 使用

前往谷歌插件商店搜索 [@cocos-fe/github-ids](https://chrome.google.com/webstore/detail/cocos-fegithub-ids/eidodebdpdgnbcphggoimbpohochfpoj/related?hl=zh-CN&authuser=0) 安装即可。

大家记得去给插件一个好评，这样我们后期的更新评审会更容易通过。
