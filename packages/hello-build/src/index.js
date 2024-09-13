#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';

// tasks
import dev from './tasks/bin-dev.js';
import build from './tasks/bin-build.js';

const packagePath = join(dirname(fileURLToPath(import.meta.url)), '../package.json');
const packageJson = JSON.parse(readFileSync(packagePath));

const program = new Command();
program.version(packageJson.version).usage('<command> [options]');

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

program.parse(process.argv);
