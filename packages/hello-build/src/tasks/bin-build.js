#!/usr/bin/env node

import { join } from 'node:path';
import { stat, readdir } from 'node:fs/promises';
import { createViteBuild, validateProject } from '../core.js';

const root = process.cwd();

export default async function (plugin) {
    const buildProjects = await getBuildProjects(plugin);

    if (!buildProjects.length) {
        console.log('不存在需要构建的项目!');
        return;
    }
    for (const project of buildProjects) {
        await createViteBuild(project);
    }
}

async function getBuildProjects(extensionName) {
    let projects = [];

    // 如果指定了构建项目，则只构建当前项目，否则构建 extensions 目录下的所有项目
    if (extensionName) {
        // 特殊处理在插件项目执行命令
        if (extensionName === '.') {
            const config = await validateProject(root);
            if (config) {
                return [config];
            }
        } else {
            try {
                await stat(join(root, './extensions', extensionName));
            } catch {
                console.error(`Error: 项目 ${extensionName} 不存在,请查看是否拼写错误！`);
                return [];
            }
            projects = [extensionName];
        }
    } else {
        projects = await readdir(join(root, './extensions'));
    }

    const list = await projects.reduce(async (res, project) => {
        const result = await res;
        const projectPath = join(root, './extensions', project);
        try {
            const config = await validateProject(projectPath);
            if (config) {
                result.push(config);
            }
        } catch (error) {}
        return result;
    }, Promise.resolve([]));

    return list;
}
