export const methods = {
    async open() {
        Editor.Panel.open('template'); 
    },
};

export function load() {
    console.log('load');
}

export function unload() {
    console.log('unload');
}