#!/usr/bin/env node
import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const root = process.cwd();

// --- 生成 dts ---
const configFile = join(root, './config.json');
if (!existsSync(configFile)) {
    console.error('没有找到 config.json，无法正常构建');
    process.exit(-1);
}

try {
    const string = readFileSync(configFile);
    const config = JSON.parse(string);

    let content = '';
    content += `/// <reference path="${join(config.enginePath, './bin/.declarations/cc.d.ts')}"/>\n`;
    content += `/// <reference path="${join(config.enginePath, '/bin/.declarations/cc.editor.d.ts')}"/>\n`;
    writeFileSync(join(root, './@types/cc.d.ts'), content);
} catch (error) {
    console.error(error);
    process.exit(-1);
}
