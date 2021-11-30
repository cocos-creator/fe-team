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
                    text: '文档1',
                    link: '/article/1'
                },
                {
                    text: '文档2',
                    link: '/article/2'
                }, {
                    text: '文档3',
                    link: '/article/3'
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