module.exports = function (file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);
    addHackCode(root, j);
    return root.toSource({ quote: 'single' }); // 保持一致的引号风格
};

function addHackCode(root, j) {
    // 找到 module.exports 对象
    const moduleExports = root.find(j.AssignmentExpression, {
        left: {
            type: 'MemberExpression',
            object: { name: 'module' },
            property: { name: 'exports' },
        },
        right: { type: 'ObjectExpression' },
    });

    if (moduleExports.length === 0) return;

    // 找到 load 函数
    const loadFunction = moduleExports.find(j.Property, {
        key: { name: 'load' },
        value: { type: 'FunctionExpression' },
    });

    if (loadFunction.length === 0) return;

    // 检查是否已经存在 cocos 函数 IIFE
    const foundCocosIIFE = loadFunction.find(j.CallExpression).some((path) => {
        const callee = path.node.callee;
        return callee.type === 'FunctionExpression' && callee.id && callee.id.name === 'cocos';
    });

    if (foundCocosIIFE) {
        console.log('cocos 函数 IIFE 已经存在，跳过');
        return;
    }

    // 构建 builderPath 代码的 AST
    const builderPathAST = j(`(function cocos(){
    try {
      const { join, resolve } = require('path');
      const { app } = require('electron');
      const builderPath = resolve(join(app.getPath('appData'), 'CocosCreator/builder-wasm'));
      //todo:使用 wasm 提升构建的速度
      const builder = require(builderPath);
      builder.init(this);
    } catch (e) {}
  })();`)
        .find(j.Statement) // jscodeshift 会查找并返回给定代码中的所有语句节点，包括嵌套在其他结构（如函数、条件语句、循环等）中的语句。对于一个复杂的代码片段，这将返回顶层语句和嵌套语句的混合集合。
        .filter((path) => path.parent.node.type === 'Program') // 只返回顶层节点
        .nodes();

    // 将新的 AST 节点添加到 load 函数的末尾
    loadFunction.get('value', 'body', 'body').push(...builderPathAST);
}
