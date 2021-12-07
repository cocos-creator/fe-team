# Github ID 翻译插件

## 前因

公司的项目是在 Github 上维护的，每个成员都使用自己的 Github ID（并不是公司统一分配，统一命名）。由于每个成员都很有个性，ID 取的琳瑯满目，要把它们和队员的真名对应起来有点困难。

目前的的方案是公共文档有一份 ID 列表，大家对照表格来识别其他的协作成员。（这一点都不互联网，也不酷）

![image](https://user-images.githubusercontent.com/35713518/145004585-e7ed56df-db9e-45c0-810a-267e1732c270.png)


于是大家觉得需要有个插件来解决这个问题。

![image](https://user-images.githubusercontent.com/35713518/145000281-102f1a01-b287-44a0-bf68-cb21d9dbfba7.png)

## 方案

利用谷歌插件，将页面上的 `Github ID` ，替换成对应的中文名。

实现流程：
- 在 Git 仓库里维护 `github-ids.json` ，利用 `workflows` 将文件同步到 oss。
- 浏览器插件从 oss 获取到最新的 `github-ids.json` 列表
- 查看 Github 页面的 DOM 结构，找出会显示 ID 的 DOM
- 将匹配到的 DOM 的内容，替换成匹配到的中文名

```js
function replaceIds() {
  const url = `https://90s.oss-cn-hangzhou.aliyuncs.com/github-ids/github-ids.json?v=${Date.now()}`;

  // 获取数据
  fetch(url).then(res => res.json()).then(data => {
    console.log(data)

    Array.from(document.querySelectorAll('.author, .assignee span, .TimelineItem-body a span'))
      .forEach(ele => {
        const text = ele.innerText;
        const textZH = data[text];
        if (!ele.dataset.github) {
          ele.dataset.github = text;
        }
        if (textZH) {
          ele.innerText = textZH;
        }
      })
  })
}
```

## 数据维护

我们把数据统一在 [这里](https://github.com/cocos-creator/cocos-fe/blob/main/projects/github-ids/github-ids.json) 维护。如果有更新人员名单，往这个[仓库](https://github.com/cocos-creator/cocos-fe) 提个 PR 即可。我们的 `workflows` 会触发相应的任务，将最新的 `github-ids.json` 推送到 OSS。

插件那边会获取到最新的数据映射表。通过如下粗暴的方式：

```
const url = `https://90s.oss-cn-hangzhou.aliyuncs.com/github-ids/github-ids.json?v=${Date.now()}`;
```

## 遇到了一些问题

Github 也是类似 SPA 的渲染方式，导致它进行路由切换的时候不会刷新页面，进而不能通过 onload 这样的方式来执行替换 ID 的逻辑。

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

## 结尾

目前浏览器插件已经开发完成，但是没有开发者账号，无法发布到谷歌商店。只能通过文件共享。