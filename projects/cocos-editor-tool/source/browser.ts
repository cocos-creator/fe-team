const pkg = require('../package.json');

const pluginPaths = [
    '/Users/alan/Documents/xr-extensions/extensions/xr-plugin',
    '/Users/alan/cocos/online-x-extensions',   
];

export const methods = {
    async open() {
        Editor.Panel.open(pkg.name); 
    },
};

export async function load() {
    for (const v of pluginPaths) {
        await Editor.Package.register(v);
        await Editor.Package.enable(v);
    }
}

export function unload() {
    console.log('unload');
}

