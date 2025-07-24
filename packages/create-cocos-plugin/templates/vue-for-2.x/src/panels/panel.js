import { createApp } from 'vue';

import { ElMessage } from 'element-plus';

import { name } from '../../package.json' with { type: 'json' };

import './style.css';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

import App from './App.vue';
import { state } from './pina';
import { keyAppRoot, keyMessage } from './provide-inject';

const weakMap = new WeakMap();

export default Editor.Panel.extend({
    template: '<div id="app" class="dark"></div>', // 只留一个 div 用于 vue 的挂载
    $: {
        root: '#app',
    },
    ready() {
        if (!this.$root) return;

        const app = createApp(App);
        app.provide(keyAppRoot, this.$root);
        app.provide(keyMessage, (options = {}) => {
            if (typeof options === 'string') {
                options = { message: options };
            }
            options.appendTo ??= this.$root;
            return ElMessage(options);
        });
        app.mount(this.$root);

        weakMap.set(this, app);
    },
    close() {
        const app = weakMap.get(this);
        app?.unmount?.();
    },
    messages: {
        [`${name}:increase`]() {
            state.a += 1;
        },
    },
});
