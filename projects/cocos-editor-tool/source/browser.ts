const pkg = require('../package.json');

const pluginPaths = [
    '/Users/alan/Documents/xr-extensions/extensions/xr-plugin',
    '/Users/alan/cocos/online-x-extensions',   
];

export const methods = {
    async open() {
        console.log(pkg.name);
        Editor.Panel.open(pkg.name); 
    },
};

export async function load() {
    for (const v of pluginPaths) {
        await Editor.Package.register(v);
        await Editor.Package.enable(v);
    }
    console.log('load');
}

export function unload() {
    console.log('unload');
}

