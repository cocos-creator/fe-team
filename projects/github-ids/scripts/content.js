console.log('我是 @cocos-fe/githubs-ids 小插件，我被启用了！');

const image = chrome.runtime.getURL('images/logo.png');

const $icon = document.createElement('div');
$icon.id = 'githubs-ids';
$icon.innerHTML = `<img src="${image}" alt="githubs-ids" />`;



document.body.appendChild($icon);

document.getElementById('githubs-ids').addEventListener('click', () => {
  replaceIds()
}, false);



function replaceIds() {
  const url = `https://90s.oss-cn-hangzhou.aliyuncs.com/github-ids/github-ids.json?v=${Date.now()}`;

  fetch(url).then(res => res.json()).then(data => {
    console.log(data)
    window.github_ids = data;

    Array.from(document.querySelectorAll('.author, .assignee span'))
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

replaceIds();
