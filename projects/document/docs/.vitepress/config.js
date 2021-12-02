module.exports = {
    title: 'COCOS FE',
    description: 'cocos FE team',
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
                text: '基建',
                link: '/core/index',
                activeMatch: '^/core/'
            },
        ],

        sidebar: {
            '/article/': getArticleSidebar(),
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
                }
            ]
        }
    ]
}

function getCoreSidebar() {
    return [
        {
            text: '基建',
            children: [{ text: 'Eslint', link: '/core/eslint' }]
        },
    ]
}