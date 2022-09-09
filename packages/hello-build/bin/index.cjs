#!/usr/bin/env node
'use strict';

var node_fs = require('node:fs');
var commander = require('commander');
var chokidar = require('chokidar');
var node_path = require('node:path');
var core = require('./core.cjs');
var promises = require('node:fs/promises');
var node_url = require('node:url');
require('vite');
require('@vitejs/plugin-vue');
require('webpack-merge');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);

function dev(project) {
    const root = process.cwd();
    
    if (project) {
        const projectPath = project === '.' ? root : node_path.join(root, './extensions', project);
    
        core.validateProject(projectPath).then((config) => {
            core.creatTask(config);
            chokidar__default["default"].watch(node_path.join(projectPath, 'source')).on('change', (event, path) => {
                core.creatTask(config);
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
        await core.creatTask(project);
    }
}

async function getBuildProjects(extensionName) {
    let projects = [];

    // 如果指定了构建项目，则只构建当前项目，否则构建 extensions 目录下的所有项目
    if (extensionName) {
        // 特殊处理在插件项目执行命令
        if (extensionName === '.') {
            const config = await core.validateProject(root$1);
            if (config) {
                return [config];
            }
        } else {
            try {
                await promises.stat(node_path.join(root$1, './extensions', extensionName));
            } catch {
                console.error(`Error: 项目 ${extensionName} 不存在,请查看是否拼写错误！`);
                return [];
            }
            projects = [extensionName];
        }
       
    } else {
        projects = node_fs.readdirSync(node_path.join(root$1, './extensions'));
    }

    const list = await projects.reduce(async (res, project) => {
        const result = await res;
        const projectPath = node_path.join(root$1, './extensions', project);
        try {
            const config = await core.validateProject(projectPath);
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
    const p = node_path.join(root, project);

    try {
        const stats = node_fs.statSync(p);
        if (stats.isDirectory()) {
            return console.error(`文件夹 ${p} 已经存在!`);
        }
    } catch (error) {
        
    }
   
    promises.mkdir(p, {recursive: true})
        .then(() => {
            const __dirname = node_path.dirname(node_url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('index.cjs', document.baseURI).href))));
            
            promises.cp(node_path.join(__dirname, '../create-template/'), p, {recursive: true});
        });
       
}

const program = new commander.Command();
const packageJson = JSON.parse(node_fs.readFileSync('package.json'));
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
        Promise.resolve().then(function () { return require('./create-engine-dts-e222feb9.js'); });
    });

program
    .command('create [plugin]')
    .description('创建一个插件模板')
    .action((plugin) => {
        create(plugin);
    });      

program.parse(process.argv);
