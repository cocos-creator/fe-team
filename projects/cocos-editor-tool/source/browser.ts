const pkg = require('../package.json');

const pluginPaths = [
    '/Users/alan/cocos/xr-extensions/extensions/xr-plugin',
];

export const methods = {
    async open() {
        Editor.Panel.open(pkg.name); 
    },
    'open-webview'() {
        Editor.Panel.open(`${pkg.name}.webview`); 
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

