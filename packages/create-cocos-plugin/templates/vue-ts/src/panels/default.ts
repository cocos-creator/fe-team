import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import App from './App.vue';
import { createApp } from 'vue';
import './style.css';

const weakMap = new WeakMap();

export default Editor.Panel.define({
    template: '<div id="app"></div>', // 只留一个 div 用于 vue 的挂载
    style: readFileSync(join(__dirname, './panel_default.css'), 'utf8'), // 直接读取 vite 构建剥离出的 css 文件
    $: {
        root: '#app',
    },
    ready() {
        if (!this.$.root) return;

        const app = createApp(App);
        app.mount(this.$.root);

        weakMap.set(this, app);
    },
    close() {
        const app = weakMap.get(this);
        app?.unmount?.();
    },
});
