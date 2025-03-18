import { createApp } from 'vue';

import App from './App.vue';
import './style.css';

const weakMap = new WeakMap();

export default Editor.Panel.define({
    template: '<div id="app"></div>', // 只留一个 div 用于 vue 的挂载
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
