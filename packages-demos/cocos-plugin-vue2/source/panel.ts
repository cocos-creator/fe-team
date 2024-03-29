import { join } from 'path';
import { readFileSync } from 'fs';
import App from './App.vue';
import Vue from 'vue';

const weakMap = new WeakMap();

export const template = '<div id="app"></div>'; // 只留一个 div 用于 vue 的 mount

export const style = readFileSync(join(__dirname, './panel.css'), 'utf8'); // 直接读取 vite 构建剥离出的 css 文件

export const $ = { root: '#app' };

export function ready() {
    // @ts-ignore
    const panel = this;

    const app = new Vue(App);
    app.$mount(panel.$.root);

    weakMap.set(panel, app);
}

export function close() {
    // @ts-ignore
    const app = weakMap.get(this);
    app?.$destroy?.();
}
