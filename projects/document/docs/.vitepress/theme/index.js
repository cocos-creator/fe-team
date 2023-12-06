import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import Documate from '@documate/vue';
import '@documate/vue/dist/style.css';

export default {
    ...DefaultTheme,
    Layout: h(DefaultTheme.Layout, null, {
        'nav-bar-content-before': () =>
            h(Documate, {
                endpoint: 'https://am3gzdjw9k.us.aircode.run/ask',
                placeholder: '请输入你的问题...',
                predefinedQuestions: ['eslint 怎么配置？', '插件构建工具怎么用？'],
            }),
    }),
};
