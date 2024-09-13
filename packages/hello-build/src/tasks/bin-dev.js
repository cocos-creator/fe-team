#!/usr/bin/env node

import chokidar from 'chokidar';
import { join } from 'node:path';
import { createViteBuild, validateProject } from '../core.js';

export default function (project) {
    const root = process.cwd();

    if (project) {
        const projectPath = project === '.' ? root : join(root, './extensions', project);

        validateProject(projectPath)
            .then((config) => {
                createViteBuild(config);
                chokidar.watch(join(projectPath, 'source')).on('change', () => {
                    // TODO：支持过滤文件，不用所有文件变动都重新构建
                    createViteBuild(config);
                });
            })
            .catch((error) => console.error(error));
    } else {
        console.warn('没有指定需要开发的插件!');
    }
}
