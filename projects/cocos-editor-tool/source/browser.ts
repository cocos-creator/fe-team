import { name } from '../package.json';

export const methods = {
    async open() {
        Editor.Panel.open(name);
    },
    'open-webview'() {
        Editor.Panel.open(`${name}.webview`);
    },
};

export async function load() {
    console.log('load');
}

export function unload() {
    console.log('unload');
}
