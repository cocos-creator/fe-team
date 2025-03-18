import { existsSync } from 'node:fs';
import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import minimist from 'minimist';
import { valid } from 'semver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../');

const argv = minimist(process.argv.slice(2), {
    default: { dev: false, v: '3.8.5' },
    alias: { v: 'version' },
    string: ['_'],
});

if (valid(argv.v) === null) {
    console.error(`${argv.v} is invalid`);
    process.exit();
}

async function getCocosPanelVersion() {
    let version = '';
    const vite_plugin_cocos_panel_pkg = join(root, '../vite-plugin-cocos-panel/package.json');
    if (existsSync(vite_plugin_cocos_panel_pkg)) {
        const pkgString = await readFile(vite_plugin_cocos_panel_pkg, { encoding: 'utf-8' });
        version = JSON.parse(pkgString).version;
    }
    return version;
}

async function rewrite() {
    const cocosPanelVersion = await getCocosPanelVersion();
    if (!cocosPanelVersion) return;

    const templates = await readdir(join(root, 'templates'));

    for (const dir of templates) {
        const tplDir = join(root, 'templates', dir);

        const info = await stat(tplDir);
        if (info.isDirectory()) {
            const pkg = join(tplDir, 'package.json');
            if (existsSync(pkg)) {
                const jsonString = await readFile(pkg, { encoding: 'utf-8' });
                if (jsonString) {
                    const json = JSON.parse(jsonString);

                    Object.assign(json.devDependencies, {
                        '@cocos-fe/vite-plugin-cocos-panel': argv.dev ? 'workspace:*' : `^${cocosPanelVersion}`,
                        '@cocos/creator-types': `^${argv.v}`,
                    });
                    writeFile(pkg, JSON.stringify(json, null, 4), { encoding: 'utf-8' });
                }
            }
        }
    }
}

rewrite();
