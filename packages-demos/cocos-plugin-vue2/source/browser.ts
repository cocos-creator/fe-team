import { name } from '../package.json';

export const methods = {
    async open() {
        console.log('open vue2');
        // @ts-ignore
        Editor.Panel.open(name);
    },
};

export async function load() {
    console.log('load');
}

export function unload() {
    console.log('unload');
}
