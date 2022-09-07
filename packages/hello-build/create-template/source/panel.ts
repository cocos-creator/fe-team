import {join} from 'path';
import {readFileSync} from 'fs';
import App from './App.vue';
import { createApp } from 'vue';

const weakMap = new WeakMap();
let panel;

export const template = '<div id="app"></div>'; // 只留一个 div 用于 vue 的 mount

export const style = readFileSync(join(__dirname, './panel.css'), 'utf8'); // 直接读取 vite 构建剥离出的 css 文件

export const $ = {root: '#app'};

export function ready() {
    panel = this;
    // 直接渲染 vue 文件，在 App.vue 里面就可以进行规范的 vue 开发。
    const app = createApp(App, {message: 'hi cocos'});
    app.mount(panel.$.root);
    weakMap.set(this, app);
}

export function close() {
    const app = weakMap.get(this);
    app?.unmount?.();
}
