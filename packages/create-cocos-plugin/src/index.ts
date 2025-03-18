import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import spawn from 'cross-spawn';
import minimist from 'minimist';
import { green, red, reset, yellow } from 'picocolors';
import prompts from 'prompts';

import { FRAMEWORKS, TEMPLATES } from './templates.js';
import type { Framework } from './templates.js';

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist<{
    template?: string;
    help?: boolean;
    version?: boolean;
}>(process.argv.slice(2), {
    default: { help: false },
    alias: { h: 'help', t: 'template', v: 'version' },
    string: ['_'],
});
const cwd = process.cwd();

// prettier-ignore
const helpMessage = `\
Usage: create-cocos-plugin [OPTION]... [DIRECTORY]

Create a new cocos-plugin project in JavaScript or TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${yellow   ('vanilla'  )}
${green    ('vue-ts         vue'      )}
`

const renameFiles: Record<string, string | undefined> = {
    _gitignore: '.gitignore',
};

const defaultTargetDir = 'cocos-plugin-project';

async function init() {
    const argTargetDir = formatTargetDir(argv._[0]);
    const argTemplate = argv.template || argv.t;

    const help = argv.help;
    if (help) {
        console.log(helpMessage);
        return;
    }

    // 显示版本信息，方便自己排查问题
    if (argv.version) {
        const pkg = JSON.parse(fs.readFileSync(path.join(fileURLToPath(import.meta.url), '../../', `package.json`), 'utf-8'));
        console.log(pkg.version);
        return;
    }

    let targetDir = argTargetDir || defaultTargetDir;
    // 故意写成函数，这样每次调用都可以根据 targetDir 得到最新的值
    const getProjectName = () => (targetDir === '.' ? path.basename(path.resolve()) : targetDir);

    let result: prompts.Answers<'projectName' | 'overwrite' | 'packageName' | 'framework' | 'variant'>;

    prompts.override({
        overwrite: argv.overwrite,
    });

    try {
        result = await prompts(
            [
                {
                    type: argTargetDir ? null : 'text',
                    name: 'projectName',
                    message: reset('Project name:'),
                    initial: defaultTargetDir,
                    onState: (state) => {
                        targetDir = formatTargetDir(state.value) || defaultTargetDir;
                    },
                },
                {
                    type: () => (!fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'select'), // 如果目标路径不为空，需要问用户如何处理
                    name: 'overwrite',
                    message: () => (targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`) + ` is not empty. Please choose how to proceed:`,
                    initial: 0,
                    choices: [
                        {
                            title: 'Remove existing files and continue',
                            value: 'yes',
                        },
                        {
                            title: 'Cancel operation',
                            value: 'no',
                        },
                        {
                            title: 'Ignore files and continue',
                            value: 'ignore',
                        },
                    ],
                },
                {
                    type: (_, { overwrite }: { overwrite?: string }) => {
                        if (overwrite === 'no') {
                            // 取消当前操作
                            throw new Error(red('✖') + ' Operation cancelled');
                        }
                        return null;
                    },
                    name: 'overwriteChecker',
                },
                {
                    // 通过路径名称生成 package.json@name 如果不合法则让用户填写名字
                    type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
                    name: 'packageName',
                    message: reset('Package name:'),
                    initial: () => toValidPackageName(getProjectName()),
                    validate: (dir) => isValidPackageName(dir) || 'Invalid package.json name',
                },
                {
                    // 如果指定的模板不在列表里面，则让用户选择模板
                    type: argTemplate && TEMPLATES.includes(argTemplate) ? null : 'select',
                    name: 'framework',
                    message:
                        typeof argTemplate === 'string' && !TEMPLATES.includes(argTemplate)
                            ? reset(`"${argTemplate}" isn't a valid template. Please choose from below: `)
                            : reset('Select a framework:'),
                    initial: 0,
                    choices: FRAMEWORKS.map((framework) => {
                        const frameworkColor = framework.color;
                        return {
                            title: frameworkColor(framework.display || framework.name),
                            value: framework,
                        };
                    }),
                },
                {
                    type: (framework: Framework) => (framework && framework.variants ? 'select' : null),
                    name: 'variant',
                    message: reset('Select a variant:'),
                    choices: (framework: Framework) => {
                        return framework.variants?.map((variant) => {
                            const variantColor = variant.color;
                            return {
                                title: variantColor(variant.display || variant.name),
                                value: variant.name,
                            };
                        });
                    },
                },
            ],
            {
                onCancel: () => {
                    throw new Error(red('✖') + ' Operation cancelled');
                },
            }
        );
    } catch (cancelled: any) {
        console.log(cancelled.message);
        return;
    }

    // user choice associated with prompts
    const { framework, overwrite, packageName, variant } = result;

    const root = path.join(cwd, targetDir);

    if (overwrite === 'yes') {
        emptyDir(root);
    } else if (!fs.existsSync(root)) {
        fs.mkdirSync(root, { recursive: true });
    }

    // determine template
    let template: string = variant || framework?.name || argTemplate;
    let isReactSwc = false;
    if (template.includes('-swc')) {
        isReactSwc = true;
        template = template.replace('-swc', '');
    }

    const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
    const pkgManager = pkgInfo ? pkgInfo.name : 'npm';
    const isYarn1 = pkgManager === 'yarn' && pkgInfo?.version.startsWith('1.');

    const { customCommand } = FRAMEWORKS.flatMap((f) => f.variants ?? []).find((v) => v.name === template) ?? {};

    // 如果有的模板提供了自定义的创建命令，那么需要根据用户使用的包管理工具，对命令进行一些适配处理
    if (customCommand) {
        const fullCustomCommand = customCommand
            .replace(/^npm create /, () => {
                // `bun create` uses it's own set of templates,
                // the closest alternative is using `bun x` directly on the package
                if (pkgManager === 'bun') {
                    return 'bun x create-';
                }
                return `${pkgManager} create `;
            })
            // Only Yarn 1.x doesn't support `@version` in the `create` command
            .replace('@latest', () => (isYarn1 ? '' : '@latest'))
            .replace(/^npm exec/, () => {
                // Prefer `pnpm dlx`, `yarn dlx`, or `bun x`
                if (pkgManager === 'pnpm') {
                    return 'pnpm dlx';
                }
                if (pkgManager === 'yarn' && !isYarn1) {
                    return 'yarn dlx';
                }
                if (pkgManager === 'bun') {
                    return 'bun x';
                }
                // Use `npm exec` in all other cases,
                // including Yarn 1.x and other custom npm clients.
                return 'npm exec';
            });

        const [command, ...args] = fullCustomCommand.split(' ');
        // we replace TARGET_DIR here because targetDir may include a space
        const replacedArgs = args.map((arg) => arg.replace('TARGET_DIR', () => targetDir));
        const { status } = spawn.sync(command, replacedArgs, {
            stdio: 'inherit',
        });
        process.exit(status ?? 0);
    }

    console.log(`\nScaffolding project in ${root}...`);

    const templateDir = path.resolve(fileURLToPath(import.meta.url), '../../templates/', `${template}`);

    const write = (file: string, content?: string) => {
        const targetPath = path.join(root, renameFiles[file] ?? file);
        if (content) {
            fs.writeFileSync(targetPath, content);
        } else {
            copy(path.join(templateDir, file), targetPath);
        }
    };

    const files = fs.readdirSync(templateDir);
    for (const file of files.filter((f) => f !== 'package.json')) {
        write(file);
    }

    const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'));

    pkg.name = packageName || getProjectName();

    pkg.contributions.menu[0].label = `i18n:${pkg.name}.title`;

    write('package.json', JSON.stringify(pkg, null, 4) + '\n');

    if (isReactSwc) {
        setupReactSwc(root, template.endsWith('-ts'));
    }

    const cdProjectName = path.relative(cwd, root);
    console.log(`\nDone. Now run:\n`);
    if (root !== cwd) {
        console.log(`  cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`);
    }
    switch (pkgManager) {
        case 'yarn':
            console.log('  yarn');
            console.log('  yarn dev');
            break;
        default:
            console.log(`  ${pkgManager} install`);
            console.log(`  ${pkgManager} run dev`);
            break;
    }
    console.log();
}

// 去掉末尾斜杆
function formatTargetDir(targetDir: string | undefined) {
    return targetDir?.trim().replace(/\/+$/g, '');
}

function copy(src: string, dest: string) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        copyDir(src, dest);
    } else {
        fs.copyFileSync(src, dest);
    }
}

function isValidPackageName(projectName: string) {
    return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName);
}

function toValidPackageName(projectName: string) {
    return projectName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/^[._]/, '')
        .replace(/[^a-z\d\-~]+/g, '-');
}

function copyDir(srcDir: string, destDir: string) {
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file);
        const destFile = path.resolve(destDir, file);
        copy(srcFile, destFile);
    }
}

function isEmpty(path: string) {
    const files = fs.readdirSync(path);
    return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

function emptyDir(dir: string) {
    if (!fs.existsSync(dir)) {
        return;
    }
    for (const file of fs.readdirSync(dir)) {
        if (file === '.git') {
            continue;
        }
        fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
    }
}

function pkgFromUserAgent(userAgent: string | undefined) {
    if (!userAgent) return undefined;
    const pkgSpec = userAgent.split(' ')[0];
    const pkgSpecArr = pkgSpec.split('/');
    return {
        name: pkgSpecArr[0],
        version: pkgSpecArr[1],
    };
}

function setupReactSwc(root: string, isTs: boolean) {
    editFile(path.resolve(root, 'package.json'), (content) => {
        return content.replace(/"@vitejs\/plugin-react": ".+?"/, `"@vitejs/plugin-react-swc": "^3.5.0"`);
    });
    editFile(path.resolve(root, `vite.config.${isTs ? 'ts' : 'js'}`), (content) => {
        return content.replace('@vitejs/plugin-react', '@vitejs/plugin-react-swc');
    });
}

function editFile(file: string, callback: (content: string) => string) {
    const content = fs.readFileSync(file, 'utf-8');
    fs.writeFileSync(file, callback(content), 'utf-8');
}

init().catch((e) => {
    console.error(e);
});
