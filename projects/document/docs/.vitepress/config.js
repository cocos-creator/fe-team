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
                },
                {
                    text: 'Git 教程',
                    link: '/article/Git教程'
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
                {
                    text: '前端项目工程实践建议',
                    link: '/article/前端项目工程实践建议'
                },
                {
                    text: 'json5',
                    link: '/article/json5'
                },
                // {
                //     text: 'assets',
                //     link: '/article/assets'
                // }
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
                { text: 'Eslint工作流', link: '/core/eslint工作流' },
                { text: 'Github ID 翻译', link: '/core/chrome-extension-github-ids' },
                { text: '编辑器插件构建', link: '/core/editor-plugin-build' },
                { text: '提议-弃用css预编译处理语言', link: '/core/弃用css预编译处理语言' },
            ]
        },
    ]
}