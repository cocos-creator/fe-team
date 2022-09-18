#!/usr/bin/env node

import {readFileSync} from 'node:fs';
import { Command } from 'commander';
import dev from './bin-dev.js';
import build from './bin-build.js';
import create from './bin-create-template.js';

const program = new Command();
const packageJson = JSON.parse(readFileSync('package.json'));
program
    .version(packageJson.version)
    .usage('<command> [options]');

program
    .command('dev <plugin>')
    .description('开发调试一个编辑器插件，需要指定插件名称')
    .action((plugin) => {
        dev(plugin);
    });    

program
    .command('build [plugin]')
    .description('构建编辑器插件，需要指定插件名称，如果忽略则全量构建')
    .action((plugin) => {
        build(plugin);
    });    

program
    .command('engine-dts')
    .description('生成引擎的 dts 文件，将存入 @types 文件夹中')
    .action(() => {
        import('./bin-create-engine-dts.js');
    });

program
    .command('create [plugin]')
    .description('创建一个插件模板')
    .action((plugin) => {
        create(plugin);
    });      

program.parse(process.argv);