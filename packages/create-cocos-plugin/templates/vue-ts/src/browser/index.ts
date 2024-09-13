import { name } from '../../package.json' with {type: 'json'};

export const methods = {
    async open() {
        console.log('open vue3');
        Editor.Panel.open(name);
    },
};

export async function load() {
    console.log('load');    
}

export function unload() {
    console.log('unload');
}
