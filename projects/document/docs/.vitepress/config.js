module.exports = {
    title: 'Cocos FE',
    description: 'Cocos FE Team',
    themeConfig: {
        repo: 'cocos-creator/cocos-fe',
        docsDir: 'docs',
        docsBranch: 'main',
        editLinks: false,
        editLinkText: 'Edit this page on GitHub',
        lastUpdated: false,

        nav: [
            {
                text: '文档',
                link: '/article/index',
                activeMatch: '^/article/'
            },
            {
                text: '踩坑',
                link: '/experience/index',
                activeMatch: '^/experience/'
            },
            {
                text: '基建',
                link: '/core/index',
                activeMatch: '^/core/'
            },
        ],

        sidebar: {
            '/article/': getArticleSidebar(),
            '/experience/': getExperienceSidebar(),
            '/core/': getCoreSidebar(),
        }
    }
}

function getArticleSidebar() {
    return [
        {
            text: '文档',
            children: [
                {
                    text: 'web-components',
                    link: '/article/web-components'
                },
                {
                    text: '关于命名的一点建议',
                    link: '/article/关于命名的一点建议'
                },
                {
                    text: 'Git 教程',
                    link: '/article/Git 教程'
                },
                {
                    text: '软链接教程',
                    link: '/article/软链接'
                },
                {
                    text: 'inspector',
                    link: '/article/inspector'
                },
                {
                    text: 'cocos creator',
                    link: '/article/cocos-creator'
                },
                // {
                //     text: 'assets',
                //     link: '/article/assets'
                // }
            ]
        }
    ]
}

function getExperienceSidebar() {
    return [
        {
            text: '踩坑',
            children: [
                {
                    text: 'json5',
                    link: '/experience/json5'
                },
            ]
        }
    ]
}

function getCoreSidebar() {
    return [
        {
            text: '基建',
            children: [
                { text: 'Eslint', link: '/core/eslint' },
                { text: 'Github ID 翻译', link: '/core/chrome-extension-github-ids' },
            ]
        },
    ]
}