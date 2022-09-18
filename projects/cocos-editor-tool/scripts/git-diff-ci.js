const execSync = require('child_process').execSync;
const path = require('path').posix;
const GITDIFF = 'git diff origin/main --name-only';
// 执行 git 的命令
const diffFiles = execSync(GITDIFF, {
    encoding: 'utf8',
})
    .split('\n')
    .filter((item) => item)
    .map((filePath) => path.normalize(filePath));

console.log(diffFiles);

// https://www.npmjs.com/package/madge 文件依赖关系树

// 其实我的场景更简单，我可以直接判断，更新的文件，是否在某个文件夹下面，就决定是否执行哪些项目的脚本
// 比如 我们的入口有 projects/document ，那么可以粗暴的认为，更新的文件路径是以 projects/document 开头的，就构建这个项目