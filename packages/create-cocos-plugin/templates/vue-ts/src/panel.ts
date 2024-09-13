import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import App from './App.vue';
import { createApp } from 'vue';
import './style.css';

const weakMap = new WeakMap();

export const template = '<div id="app">123</div>'; // 只留一个 div 用于 vue 的挂载

export const style = readFileSync(join(__dirname, './panel.css'), 'utf8'); // 直接读取 vite 构建剥离出的 css 文件

export const $ = { root: '#app' };

export function ready() {
    // @ts-ignore
    const panel = this;

    const app = createApp(App);
    app.mount(panel.$.root);

    weakMap.set(panel, app);
}

export function close() {
    // @ts-ignore
    const app = weakMap.get(this);
    app?.unmount?.();
}
