#!/usr/bin/env node
'use strict';

var node_path = require('node:path');
var node_fs = require('node:fs');

const root = process.cwd();

// --- 生成 dts ---
const configFile = node_path.join(root, './config.json');
if (!node_fs.existsSync(configFile)) {
    console.error('没有找到 config.json，无法正常构建');
    process.exit(-1);
}

try {
    const string = node_fs.readFileSync(configFile);
    const config = JSON.parse(string);

    let content = '';
    content += `/// <reference path="${node_path.join(config.enginePath, './bin/.declarations/cc.d.ts')}"/>\n`;
    content += `/// <reference path="${node_path.join(config.enginePath, '/bin/.declarations/cc.editor.d.ts')}"/>\n`;
    node_fs.writeFileSync(node_path.join(root, './@types/cc.d.ts'), content);
} catch (error) {
    console.error(error);
    process.exit(-1);
}
