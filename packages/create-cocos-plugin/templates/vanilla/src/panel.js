import './style.css';
import { setupCounter } from './counter.js';
import javascriptLogo from './assets/javascript.svg';
import viteLogo from './assets/vite.svg';
import cocosLogo from './assets/cocos.png';

export default Editor.Panel.define({
    template: /* html*/ `
    <div id="app">
        <div>
            <a href="https://vitejs.dev" target="_blank">
            <img src="${viteLogo}" class="logo" alt="Vite logo" />
            </a>
            <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
            <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
            </a>
            <a href="https://www.cocos.com/" target="_blank">
            <img src="${cocosLogo}" class="logo cocos" alt="Cocos logo" />
            </a>
            <h1>Hello Vite + Cocos Creator Plugin!</h1>
            <div class="card">
            <button id="counter" type="button"></button>
            </div>
            <p class="read-the-docs">
            Click on the Vite logo to learn more
            </p>
        </div>
    </div>`,
    $: {
        root: '#app',
        counter: '#counter',
    },
    ready() {
        if (!this.$.root) return;
        setupCounter(this.$.counter);
    },
    close() {
        this.$.root.innerHTML = '';
    },
});
