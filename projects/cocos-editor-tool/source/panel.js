import { join } from 'path';
import { readFileSync } from 'fs';
import App from './App.vue';
import { createApp } from 'vue';

const weakMap = new WeakMap();

export const template = '<div id="app"></div>'; // 只留一个 div 用于 vue 的 mount

export const style = readFileSync(join(__dirname, './panel.css'), 'utf8'); // 直接读取 vite 构建剥离出的 css 文件

export const $ = { root: '#app' };

export function ready() {
    const panel = this;

    const app = createApp(App);
    app.mount(panel.$.root);

    weakMap.set(this, app);
}

export function close() {
    const app = weakMap.get(this);
    app?.unmount?.();
}
