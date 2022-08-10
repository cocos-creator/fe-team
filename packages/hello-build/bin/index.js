#!/usr/bin/env node

import {promises as fs} from 'node:fs';
const packageJson = JSON.parse(await fs.readFile('package.json'));
import { Command } from 'commander';
const program = new Command();

program
    .version(packageJson.version)
    .usage('<command> [options]')
    .command('dev', '开发调试一个编辑器插件，需要指定插件名称')
    .command('build', '构建编辑器插件，需要指定插件名称，如果忽略则全量构建')
    .command('engine-dts', '生成引擎的 dts 文件，将存入 @types 文件夹中');

program.parse(process.argv);