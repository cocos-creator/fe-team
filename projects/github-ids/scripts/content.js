console.log('我是 @cocos-fe/githubs-ids 小插件，我被启用了！');

function createIcon() {
  const image = chrome.runtime.getURL('images/logo.png');
  const $icon = document.createElement('div');
  $icon.id = 'githubs-ids';
  $icon.innerHTML = `<img src="${image}" alt="githubs-ids" />`;
  $icon.addEventListener('click', replaceIds, false);
  document.body.appendChild($icon);
}

// 替换id
function replaceIds() {
  const url = `https://90s.oss-cn-hangzhou.aliyuncs.com/github-ids/github-ids.json?v=${Date.now()}`;

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

// 监听路由等事件
['hashchange', 'popstate', 'load'].forEach(e => {
  window.addEventListener(e, () => {
    replaceIds();
    if (e === 'load') {
      observerProgress();
      createIcon();
    }
  })
})


// 通过监听 github 的页面切换进度条来判断是否完成路由切换
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



