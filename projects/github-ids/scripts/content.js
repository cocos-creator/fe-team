console.log('我是 @cocos-fe/githubs-ids 小插件，我被启用了！');

const $panel = document.createElement('div');
$panel.id = 'githubs-ids';

function createPanel() {
  const image = chrome.runtime.getURL('images/logo.png');

  $panel.innerHTML = `
    <div class="icon">
      <img src="${image}" alt="githubs-ids" />
    </div>
    <ul></ul>
  `;

  $panel.querySelector('.icon').addEventListener('click', () => {
    $panel.classList.toggle('show');
    if ($panel.querySelectorAll('ul li').length === 0) {
      replaceIds();
    }
  }, false);

  $panel.querySelector('ul').addEventListener('click', ({ target }) => {
    copy(target.innerText);
  })
  document.body.appendChild($panel);
}

function createList(data) {
  const fragment = document.createDocumentFragment();
  Object.entries(data).forEach(([k, v]) => {
    const li = document.createElement('li');
    li.innerHTML = `<div class="en">${k}</div><div class="zh">${v}</div>`;
    fragment.appendChild(li);
  });
  $panel.querySelector('ul').innerHTML = '';
  $panel.querySelector('ul').appendChild(fragment);
}

// 替换id
function replaceIds() {
  const url = `https://90s.oss-cn-hangzhou.aliyuncs.com/github-ids/github-ids.json?v=${Date.now()}`;

  fetch(url).then(res => res.json()).then(data => {
    createList(data);

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
      createPanel();
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



function setClipboard(text) {

  navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
    if (result.state === 'granted') {

      let data = new DataTransfer();
      data.items.add("text/plain", text);
      navigator.clipboard.write(data).then(function () {
        console.log(text);
      }, function () {
        console.log('copy fail', text);
      });

    } else if (result.state === 'prompt') {

    } else {
      console.log('当前页面无法获取复制权限！')
    }
  })
}

function copy(text) {
  var id = 'mycustom-clipboard-textarea-hidden-id';
  var existsTextarea = document.getElementById(id);

  if (!existsTextarea) {
    var textarea = document.createElement('textarea');
    textarea.id = id;
    textarea.style.position = 'fixed';
    textarea.style.top = '-1px';
    textarea.style.left = '-1px';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.padding = 0;
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';

    document.querySelector('body').appendChild(textarea);
    existsTextarea = document.getElementById(id);
  }

  existsTextarea.value = text;
  existsTextarea.select();

  return new Promise((resolve, reject) => {
    try {
      var status = document.execCommand('copy');
      if (status) {
        resolve();
      } else {
        reject(new Error('复制失败！'));
      }
    } catch (err) {
      reject(err);
    }
  });
}

