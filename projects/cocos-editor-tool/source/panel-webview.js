import { join } from 'path';

let panel;
export const template = '<webview id="app" style="height: 100%;" webpreferences="contextIsolation=false"></webview>';

export const $ = { root: '#app' };

export function ready() {
    panel = this;
    panel.$.root.setAttribute('useragent', Editor.App.userAgent);
    panel.$.root.setAttribute('preload', `file://${join(__dirname, '/preload.js')}`);
    panel.$.root.setAttribute('src', 'http://localhost:5123/');

    panel.$.root.addEventListener('ipc-message', event => {
        console.log('panel 接收到的消息:', event);

        switch (event.channel) {
            case 'test1':
                console.log(event.args);
                break;
            case 'query-info':
                panel.$.root.send('ping', {
                    channel: 'query-info',
                    value: Editor.Project.uuid,
                });
                break;
            default:
        }
    });

    // 语言环境
    panel.$.root.addEventListener('dom-ready', () => {
        panel.changeI18n(Editor.I18n.getLanguage());

        Editor.Message.addBroadcastListener('i18n:change', panel.changeI18n);
    });
}

export const methods = {
    changeI18n(lang) {
        panel.$.root.send('ping', {
            channel: 'i18n',
            value: lang,
        });
    },
};

export function close() {

}
