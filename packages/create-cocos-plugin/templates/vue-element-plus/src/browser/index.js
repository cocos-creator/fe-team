import { name } from '../../package.json' with {type: 'json'};

export const methods = {
    async open() {
        Editor.Panel.open(name);
    },
};

export async function load() {
    console.log('load');    
}

export function unload() {
    console.log('unload');
}
