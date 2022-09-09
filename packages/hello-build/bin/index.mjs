#!/usr/bin/env node
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { Command } from 'commander';
import chokidar from 'chokidar';
import { join, dirname } from 'node:path';
import { validateProject, creatTask } from './core.mjs';
import { stat, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import 'vite';
import '@vitejs/plugin-vue';
import 'webpack-merge';

function dev(project) {
    const root = process.cwd();
    
    if (project) {
        const projectPath = project === '.' ? root : join(root, './extensions', project);
    
        validateProject(projectPath).then((config) => {
            creatTask(config);
            chokidar.watch(join(projectPath, 'source')).on('change', (event, path) => {
                creatTask(config);
            });
        }).catch((error) => console.error(error));
       
    } else {
        console.warn('没有指定需要开发的插件!');
    }
}

const root$1 = process.cwd();

async function build(plugin) {
    const buildProjects = await getBuildProjects(plugin);

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
        // 特殊处理在插件项目执行命令
        if (extensionName === '.') {
            const config = await validateProject(root$1);
            if (config) {
                return [config];
            }
        } else {
            try {
                await stat(join(root$1, './extensions', extensionName));
            } catch {
                console.error(`Error: 项目 ${extensionName} 不存在,请查看是否拼写错误！`);
                return [];
            }
            projects = [extensionName];
        }
       
    } else {
        projects = readdirSync(join(root$1, './extensions'));
    }

    const list = await projects.reduce(async (res, project) => {
        const result = await res;
        const projectPath = join(root$1, './extensions', project);
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

const root = process.cwd();

function create(project = 'create-template') {
    const p = join(root, project);

    try {
        const stats = statSync(p);
        if (stats.isDirectory()) {
            return console.error(`文件夹 ${p} 已经存在!`);
        }
    } catch (error) {
        
    }
   
    mkdir(p, {recursive: true})
        .then(() => {
            const __dirname = dirname(fileURLToPath(import.meta.url));
            
            cp(join(__dirname, '../create-template/'), p, {recursive: true});
        });
       
}

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
        import('./create-engine-dts-f6aabfc8.js');
    });

program
    .command('create [plugin]')
    .description('创建一个插件模板')
    .action((plugin) => {
        create(plugin);
    });      

program.parse(process.argv);
