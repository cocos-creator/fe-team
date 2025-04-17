let autoShow = true;
chrome.storage.sync.get(['autoShow'], function (data) {
    autoShow = data.autoShow ?? true;
});

function interIssueButton() {
    const topics = document.querySelectorAll('.post-stream .topic-post');
    if (!topics) return;

    for (const topic of topics) {
        const content = topic.querySelector('.topic-body .cooked').innerHTML;

        const $actions = topic.querySelector('.actions');

        const $postMunuArea = topic.querySelector('.post-menu-area');
        const isReady = $postMunuArea.querySelector('#issue-box');
        if (isReady) {
            continue;
        }

        let link = location.origin + $actions.querySelector('.share').dataset.shareUrl;
        link = `Forum link: [${link}](${link})`;

        const issueTitle = `[forum]: ${document.title}`;
        const issueBody = content + '\n\n' + link;

        const btns = [
            {
                link: `https://github.com/cocos/3d-tasks/issues/new?`,
                text: ' Creator',
            },
            {
                link: `https://github.com/cocos/cocos-engine/issues/new?`,
                text: 'Engine',
            },
        ];

        const $issueBox = document.createElement('div');
        $issueBox.id = 'issue-box';
        $issueBox.dataset.tip = 'Create issue for ';

        btns.forEach((btn) => {
            const $btn = document.createElement('a');
            $btn.href = btn.link + `title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;
            $btn.target = '_blank';
            $btn.innerText = btn.text;
            $issueBox.append($btn);
        });
        if (autoShow) {
            $postMunuArea.classList.remove('hover-show-issue-btn');
        } else {
            $postMunuArea.classList.add('hover-show-issue-btn');
        }
        $postMunuArea.prepend($issueBox);
    }
}

function removeIssueButton() {
    const topics = document.querySelectorAll('.post-stream .topic-post');
    if (!topics) return;

    for (const topic of topics) {
        const $issueBox = topic.querySelector('.post-controls #issue-box');
        if ($issueBox) {
            $issueBox.parentElement.removeChild($issueBox);
        }
    }
}

function tryInsertTimes() {
    const times = [0, 500, 1000, 1500, 2000, 2500, 3000];
    times.forEach((time) => {
        setTimeout(() => {
            interIssueButton();
        }, time);
    });
}

// 从论坛首页点击 A 标签跳转到某个帖子，不会触发 popstate 等事件
let _url_ = '';
function bindClickAndScroll() {
    document.addEventListener(
        'click',
        () => {
            // 延时为了得到变化后的 href
            setTimeout(() => {
                if (_url_ !== location.href) {
                    _url_ = location.href;
                    tryInsertTimes();
                }
            }, 200);
        },
        true, // 里面的 a 的事件可能被阻止冒泡了，所有需要 true
    );

    let timer = null;
    document.addEventListener(
        'scroll',
        () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            timer = setTimeout(() => {
                interIssueButton();
            }, 200);
        },
        false,
    );
}

// 监听路由等事件
['hashchange', 'popstate', 'load'].forEach((event) => {
    window.addEventListener(event, () => {
        tryInsertTimes();

        if (event === 'load') {
            bindClickAndScroll();
        }
    });
});
