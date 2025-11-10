console.log('我是 @cocos-fe/chrome-tools 小插件，我被启用了！');

const $panel = document.createElement('div');
$panel.id = 'github-ids';

const tipText = '点击名称复制！';
let timer = null;
let idsMap = {}; // 名单列表
const storageKey = 'cocos-github-ids';

chrome.storage.sync.get([storageKey], (result) => {
    console.log('storage.get:', result[storageKey]);
    idsMap = result[storageKey] ?? {};
});

function createPanel() {
    const image = chrome.runtime.getURL('github/assets/github.png');
    const updateImage = chrome.runtime.getURL('github/assets/update.png');
    const updateImageDark = chrome.runtime.getURL('github/assets/update-dark.png');
    $panel.innerHTML = `
    <div class="icon">
      <img src="${image}" alt="github-id" />
    </div>
    <input type="text" />
    <ul></ul>
    <div class="tip"><span>${tipText}</span> 
      <img class="update" title="更新数据" width="14" height="14" src="${updateImage}" />
      <img class="update-dark" title="更新数据" width="14" height="14" src="${updateImageDark}" />
    </div>
  `;

    $panel.querySelector('.icon').addEventListener(
        'click',
        () => {
            $panel.classList.toggle('show');
        },
        false,
    );

    $panel.querySelector('input').addEventListener('input', (e) => {
        search(e.target.value);
    });

    $panel.querySelector('ul').addEventListener('click', ({ target }) => {
        if (target.innerText) {
            copy(target.innerText).then(message);
        }
    });

    $panel.querySelector('.tip').addEventListener('click', () => {
        update();
    });

    $panel.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    document.body.addEventListener('click', () => {
        $panel.classList.remove('show');
    });
    document.body.appendChild($panel);
}

// 手动更新数据
async function update() {
    await fetchList();
    createList();
    replaceIds();
}

function search(value) {
    if (value) {
        const list = Object.entries(idsMap).reduce((result, next) => {
            const [k, v] = next;
            if (v.includes(value) || k.includes(value)) {
                result.push(next);
            }
            return result;
        }, []);
        createList(list);
    } else {
        createList();
    }
}

// 创建列表
function createList(list) {
    if (!list) {
        list = Object.entries(idsMap);
    }
    const fragment = document.createDocumentFragment();
    list.forEach(([k, v]) => {
        const li = document.createElement('li');
        li.innerHTML = `<div class="en">${k}</div><div class="zh">${v}</div>`;
        fragment.appendChild(li);
    });
    $panel.querySelector('ul').innerHTML = '';
    $panel.querySelector('ul').appendChild(fragment);
}

// 更新数据
async function fetchList() {
    const url = `https://raw.githubusercontent.com/cocos-creator/fe-team/main/projects/chrome-tools/github/github-ids.json?v=${Date.now()}`;
    return fetch(url)
        .then((res) => res.json())
        .then((data) => {
            idsMap = data;
            chrome.storage.sync.set({ [storageKey]: data }, () => {
                console.log('storage.set:', data);
            });
            return data;
        });
}

// 替换页面id
function replaceIds() {
    const selector = [
        '.author', // PR页面
        '.assignee span',
        '.TimelineItem-body a span',
        '.commit-author',
        '.BorderGrid-row li a strong',
        'a[rel="contributor"]',
        '.opened-by a.Link--muted',
        '[data-testid]', // issue 的页面
        '[class*="issue-item-module__authorCreatedLink"]', // isssue 列表
    ].join();
    Array.from(document.querySelectorAll(selector)).forEach((ele) => {
        const text = ele.innerText;
        const textZH = idsMap[text];
        if (textZH) {
            ele.innerText = textZH;
        }
    });
}

// 通过监听 github 的页面切换进度条来判断是否完成路由切换
function observerProgress() {
    const mb = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                if (mutation.removedNodes.length > 0) {
                    if (Array.from(mutation.removedNodes).some((node) => node.nodeName === 'DIV' && node.classList.contains('turbo-progress-bar'))) {
                        // 2025-04-16 此时的 github 是动态创建一个 .turbo-progress-bar 再进度走完之后又移除它
                        // 所以这边监听 dom 的移除事件即可
                        delayRepeat();
                    }
                }
            }
        }
    });
    mb.observe(document, { childList: true, subtree: true });

    // github 改版了，不再是通过这个进度条
    // const $progress = document.querySelector('.Progress-item');
    // const callback = function (mutationsList) {
    //     for (const mutation of mutationsList) {
    //         if (mutation.type === 'attributes') {
    //             const press = parseInt($progress.style.width, 10);
    //             if (press && press > 95) {
    //                 delayRepeat();
    //             }
    //         }
    //     }
    // };

    // const observer = new MutationObserver(callback);
    // observer.observe($progress, { attributes: true });
}

// 复制
function copy(text) {
    const textarea = document.createElement('textarea');
    textarea.style.all = 'unset';
    textarea.style.position = 'fixed';
    textarea.style.top = '110%';
    textarea.style.left = '110%';

    document.body.appendChild(textarea);

    textarea.value = text;
    textarea.select();

    return new Promise((resolve, reject) => {
        try {
            const status = document.execCommand('copy');
            if (status) {
                resolve(true);
            } else {
                reject(new Error('复制失败!'));
            }
        } catch (err) {
            reject(err);
        } finally {
            textarea.parentNode?.removeChild(textarea);
        }
    });
}

// 复制成功提示
function message() {
    if (timer === null) {
        $panel.querySelector('.tip span').innerText = '复制成功！';
        timer = window.setTimeout(() => {
            timer = null;
            $panel.querySelector('.tip span').innerText = tipText;
        }, 1500);
    } else {
        window.clearTimeout(timer);
        timer = null;
    }
}

// 监听路由等事件
['hashchange', 'popstate', 'load'].forEach((ev) => {
    window.addEventListener(ev, async () => {
        if (!idsMap || Object.keys(idsMap).length === 0) {
            await fetchList();
        }
        delayRepeat();
        if (ev === 'load') {
            observerProgress();
            createPanel();
            createList();
        }
    });
});

function delayRepeat() {
    const times = [0, 500, 1000, 1500, 2000, 2500, 3000];
    times.forEach((time) => {
        setTimeout(replaceIds, time);
    });
}
