#!/usr/bin/env node

import { join } from 'path';
import { stat } from 'fs/promises';
import { readdirSync } from 'fs';
import { creatTask, validateProject } from '../src/core.js';

const root = process.cwd();

async function start() {
    const buildProjects = await getBuildProjects(process.argv.slice(2)[0]);

    if (!buildProjects.length) {
        console.log('不存在需要构建的项目!');
        return;
    }
    for (const project of buildProjects) {
        await creatTask(project);
    }
}

async function getBuildProjects(extensionName) {
    let projects = [];

    // 如果指定了构建项目，则只构建当前项目，否则构建 extensions 目录下的所有项目
    if (extensionName) {
        try {
            await stat(join(root, './extensions', extensionName));
        } catch {
            console.error(`Error: 项目 ${extensionName} 不存在,请查看是否拼写错误！`);
            return [];
        }
        projects = [extensionName];
    } else {
        projects = readdirSync(join(root, './extensions'));
    }

    const list = await projects.reduce(async (res, project) => {
        const result = await res;
        const projectPath = join(root, './extensions', project);
        try {
            const config = await validateProject(projectPath);
            if (config) {
                result.push(config);
            }
        } catch (error) { }
        return result;
    }, Promise.resolve([]));

    return list;
}

start();