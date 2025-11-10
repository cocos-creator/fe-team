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
        // if (autoShow) {
        //     $postMunuArea.classList.remove('hover-show-issue-btn');
        // } else {
        //     $postMunuArea.classList.add('hover-show-issue-btn');
        // }
        $postMunuArea.prepend($issueBox);
    }
}

function removeIssueButton() {
    const topics = document.querySelectorAll('.post-stream .topic-post');
    if (!topics) return;

    for (const topic of topics) {
        const $issueBox = topic.querySelector('#issue-box');
        if ($issueBox) {
            $issueBox.parentElement.removeChild($issueBox);
        }
    }
}

document.addEventListener(
    'keydown',
    (e) => {
        if (e.key === 'Meta') {
            interIssueButton();
        }
    },
    false,
);

document.addEventListener(
    'keyup',
    (e) => {
        if (e.key === 'Meta') {
            removeIssueButton();
        }
    },
    false,
);
