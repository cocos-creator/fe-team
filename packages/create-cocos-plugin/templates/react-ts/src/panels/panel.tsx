import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const weakMap = new WeakMap();

export default Editor.Panel.define({
    template: '<div id="root"></div>', // 只留一个 div 用于 react 的挂载
    $: {
        root: '#root',
    },
    ready() {
        if (!this.$.root) return;

        const app = createRoot(this.$.root);
        app.render(
            <StrictMode>
                <App />
            </StrictMode>
        );

        weakMap.set(this, app);
    },
    close() {
        const app = weakMap.get(this);
        app?.unmount?.();
    },
});
