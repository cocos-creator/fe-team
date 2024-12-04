import type { Plugin } from 'vite';
import type { Program, Property, Identifier, Node, TaggedTemplateExpression, ObjectExpression, CallExpression } from 'estree';
import * as acorn from 'acorn'; // code to ast
import { walk } from 'estree-walker'; // walk ast
import { generate } from 'astring'; // ast to code
import { extname, basename } from 'node:path';

export function cocosPanelConfig(): Plugin {
    return {
        name: 'cocos-panel-config',
        version: '0.0.1',
        apply: 'build',
        enforce: 'pre',

        config() {
            return {
                build: {
                    cssCodeSplit: true, // 重要：按每个 panel 入口拆分 css，下面的插件将依据这个特性将对应的 css 塞到 panel 的 style 去。
                },
            };
        },
    };
}

export function cocosPanelCss(option: { transform?: (css: string) => string } = {}): Plugin {
    const styleMap: { [k: string]: string } = {};

    return {
        name: 'cocos-panel-css',
        version: '0.0.1',
        apply: 'build',
        enforce: 'post',

        generateBundle(_, bundle) {
            for (const key in bundle) {
                const chunk = bundle[key];
                // 找到以 js 结尾的库入口文件
                if (chunk?.type === 'chunk' && chunk.fileName.match(/.[cm]?js$/) !== null && !chunk.fileName.includes('polyfill')) {
                    // 匹配库入口文件对应的 css 文件
                    const js_name = basename(key, extname(key));
                    const css_key = js_name + '.css';
                    const css_chunk = bundle[css_key];

                    // 注意:只有当某个 js 入口文件具备自己的 css 样式时，它才会有对应的 css 入口
                    // 如果某个 js 只导入了公共 css，是不会有样式的。
                    if (css_chunk?.type === 'asset' && css_chunk.fileName.includes('.css')) {
                        styleMap[key] = '\n' + css_chunk.source;
                        delete bundle[css_key];
                    }
                }
            }

            // 这边还能找到的 css 是公共 css，需要给每个入口文件都添加一下公共 css
            for (const key in bundle) {
                const chunk = bundle[key];
                if (chunk?.type === 'asset' && chunk.fileName.includes('.css')) {
                    for (const styleKey in styleMap) {
                        styleMap[styleKey] += chunk.source;
                    }
                    delete bundle[key];
                }
            }

            for (const key in bundle) {
                const chunk = bundle[key];
                let styleCode = styleMap[key];

                if (styleCode) {
                    if (typeof option.transform === 'function') {
                        styleCode = option.transform(styleCode);
                    }
                }
                if (
                    chunk?.type === 'chunk' &&
                    chunk.fileName.match(/.[cm]?js$/) !== null &&
                    !chunk.fileName.includes('polyfill') &&
                    chunk.code.includes('Editor.Panel.define') &&
                    styleCode
                ) {
                    const ast = acorn.parse(chunk.code, { ecmaVersion: 'latest', sourceType: 'module' }) as Program;

                    walk(ast, {
                        enter(node) {
                            if (isEditorPanelDefine(node)) {
                                // 获取 define 方法的第一个参数（对象）
                                if (node.arguments[0] && node.arguments[0].type === 'ObjectExpression') {
                                    const defineProps = node.arguments[0] as ObjectExpression;

                                    // 寻找 style 属性并替换
                                    let foundStyle = false;
                                    for (let i = 0; i < defineProps.properties.length; i++) {
                                        const prop = defineProps.properties[i] as Property;

                                        if (typeof prop.key === 'object' && (prop.key as Identifier).name === 'style') {
                                            foundStyle = true;
                                            prop.value = createTemplateLiteralNode(styleCode);
                                        }
                                    }

                                    // 如果没有找到 style 属性，则添加一个新的 style 属性
                                    if (!foundStyle) {
                                        defineProps.properties.push({
                                            type: 'Property',
                                            key: {
                                                type: 'Identifier',
                                                name: 'style',
                                            },
                                            value: createTemplateLiteralNode(styleCode),
                                            kind: 'init',
                                            method: false,
                                            shorthand: false,
                                            computed: false,
                                        });
                                    }

                                    // 重新生成代码
                                    chunk.code = generate(ast);
                                }
                            }
                        },
                    });
                }
            }
        },
    };
}

function isEditorPanelDefine(node: Node): node is CallExpression {
    return (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'MemberExpression' && // 确保 object 也是 MemberExpression
        node.callee.object.object.type === 'Identifier' &&
        node.callee.object.object.name === 'Editor' &&
        node.callee.object.property.type === 'Identifier' &&
        node.callee.object.property.name === 'Panel' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'define'
    );
}

function createTemplateLiteralNode(content: string): TaggedTemplateExpression {
    // 创建包含单个 TemplateElement 的 TemplateLiteral 节点
    // 因为我们非常确定 styleCode 是一个整体的字符串 没有 ${} 表达式
    // https://github.com/estree/estree/blob/master/es2015.md#templateelement
    const templateElement = {
        type: 'TemplateElement' as const, // Tip: as const 可以让 ts 更好的推断字面量类型
        tail: true,
        value: {
            raw: content,
            cooked: content,
        },
    };

    // 创建 TemplateLiteral 节点，并添加标签标识 `/* css */`
    // https://github.com/estree/estree/blob/master/es2015.md#taggedtemplateexpression
    return {
        type: 'TaggedTemplateExpression',
        tag: {
            type: 'Identifier',
            name: '/* css */',
        },
        quasi: {
            type: 'TemplateLiteral',
            quasis: [templateElement],
            expressions: [],
        },
    };
}
