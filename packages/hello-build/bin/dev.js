#!/usr/bin/env node

import chokidar from 'chokidar';
import { join } from 'path';
import { creatTask, validateProject } from '../src/core.js';

const root = process.cwd();
const project = process.argv.slice(2)[0];

if (project) {
    const projectPath = join(root, './extensions', project);

    validateProject(projectPath).then((config) => {
        creatTask(config);
        chokidar.watch(join(projectPath, 'source')).on('change', (event, path) => {
            creatTask(config);
        });
    }).catch((error) => console.error(error));
   
} else {
    console.warn('没有指定需要开发的插件!');
}

