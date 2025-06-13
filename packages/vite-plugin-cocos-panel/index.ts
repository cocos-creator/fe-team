import { extname, basename } from 'node:path';

import { parse } from 'acorn'; // code to ast
import { simple } from 'acorn-walk'; // walk ast
import MagicString from 'magic-string';
import { WebSocket, WebSocketServer } from 'ws';

import type { FunctionExpression, ArrowFunctionExpression, Node, CallExpression, Property, SpreadElement } from 'acorn';
import type { Plugin, Rollup } from 'vite';

export function cocosPanelConfig(): Plugin {
    return {
        name: 'cocos-panel-config',
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

export function cocosPanel(option: { transform?: (css: string) => string; autoReload?: boolean; port?: number }): Plugin {
    let wss: WebSocketServer | null = null;
    let enableWSS = false;
    const wss_message = 'reload';

    const _option = Object.assign({ autoReload: true, port: 8080 }, option);

    return {
        name: 'cocos-panel',
        apply: 'build',
        enforce: 'post',

        configResolved(config) {
            enableWSS = config.mode === 'development' && _option.autoReload;
            if (enableWSS && !wss) {
                wss = new WebSocketServer({ port: _option.port });
                wss.on('error', (err) => {
                    console.warn('[cocos-panel] WebSocket error:', err.message);
                });
            }
        },

        generateBundle(_, bundle) {
            const styleMap: { [k: string]: string } = {};

            for (const key in bundle) {
                const chunk = bundle[key];
                // 找到以 js 结尾的库入口文件
                if (jsJSChunk(chunk)) {
                    // 匹配库入口文件对应的 css 文件
                    const js_name = basename(key, extname(key));
                    const css_key = js_name + '.css';
                    const css_chunk = bundle[css_key];

                    // 注意:只有当某个 js 入口文件具备自己的 css 样式时，它才会有对应的 css 入口
                    // 如果某个 js 只导入了公共 css，是不会有样式的。
                    if (isCSSAsset(css_chunk) && typeof css_chunk.source === 'string') {
                        styleMap[key] = '\n' + css_chunk.source;
                        delete bundle[css_key];
                    }
                }
            }

            // 这边还能找到的 css 是公共 css，需要给每个入口文件都添加一下公共 css
            for (const key in bundle) {
                const chunk = bundle[key];
                if (isCSSAsset(chunk)) {
                    for (const styleKey in styleMap) {
                        styleMap[styleKey] += chunk.source;
                    }
                    delete bundle[key];
                }
            }

            for (const key in bundle) {
                const chunk = bundle[key];

                // 符合预期的 creator panel 才进行处理
                if (jsJSChunk(chunk) && chunk.code.includes('Editor.Panel.define')) {
                    const ast = parse(chunk.code, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
                    const s = new MagicString(chunk.code);

                    simple(ast, {
                        CallExpression(node) {
                            if (isEditorPanelDefine(node)) {
                                // 获取 Editor.Panel.define 方法的第一个参数（它是个对象）
                                const defineProps = node.arguments[0];
                                if (defineProps?.type !== 'ObjectExpression') return;
                                if (defineProps.properties.length === 0) return;

                                function isProperty(prop: Property | SpreadElement, name: string): prop is Property & { key: { name: string } } {
                                    return (
                                        prop.type === 'Property' &&
                                        !prop.computed &&
                                        // 对象的 key 可能有引号，AST 中类型为 Literal
                                        ((prop.key.type === 'Identifier' && prop.key.name === name) || (prop.key.type === 'Literal' && prop.key.value === name))
                                    );
                                }

                                let styleCode = styleMap[key];
                                if (styleCode) {
                                    if (typeof option.transform === 'function') {
                                        styleCode = option.transform(styleCode);
                                    }
                                    styleCode = escapeTemplateString(styleCode);

                                    // 寻找 style 属性 执行替换 or 追加
                                    const styleProp = defineProps.properties.find((prop) => isProperty(prop, 'style'));
                                    if (styleProp) {
                                        const start = styleProp.value.start;
                                        const end = styleProp.value.end;
                                        s.overwrite(start, end, `/* css */ \`${styleCode}\``);
                                    } else {
                                        // 插入 style 属性
                                        const lastProp = defineProps.properties[defineProps.properties.length - 1];
                                        const insertionPoint = lastProp.end;

                                        // 默认对象的最后一个属性没有跟逗号，这边在新增属性的时候前置一个逗号
                                        s.appendRight(insertionPoint, `, style: /* css */ \`${styleCode}\``);
                                    }
                                }

                                // 处理自动刷新的代码
                                if (enableWSS) {
                                    const reloadCode = escapeTemplateString(`
                                    const socket = new WebSocket('ws://localhost:${_option.port}');
                                    socket.addEventListener('message', (event) => {
                                        if (event.data === '${wss_message}') {
                                            window.location.reload();
                                        }
                                    });
                                    `).trim();

                                    function isReadyFunctionProp(prop: Property | SpreadElement): prop is Property & { value: FunctionExpression | ArrowFunctionExpression } {
                                        return isProperty(prop, 'ready') && (prop.value.type === 'FunctionExpression' || prop.value.type === 'ArrowFunctionExpression');
                                    }

                                    const readyProp = defineProps.properties.find((prop) => isReadyFunctionProp(prop));

                                    if (readyProp) {
                                        const funcBody = readyProp.value.body;

                                        // 如果是箭头函数但不是块语句，则包裹成 {}
                                        if (readyProp.value.type === 'ArrowFunctionExpression' && funcBody.type !== 'BlockStatement') {
                                            const start = funcBody.start;

                                            const end = funcBody.end;
                                            const originalCode = chunk.code.slice(start, end);
                                            const replacement = `{ ${originalCode}; \n ${reloadCode} }`;
                                            s.overwrite(start, end, replacement);
                                        } else if (funcBody.type === 'BlockStatement') {
                                            // 普通函数体，在最后一个 } 前插入代码

                                            const insertPos = funcBody.end - 1; // right before closing }

                                            s.appendRight(insertPos, `\n${reloadCode}\n`);
                                        }
                                    } else {
                                        const lastProp = defineProps.properties[defineProps.properties.length - 1];
                                        const insertionPoint = lastProp.end;

                                        // 默认对象的最后一个属性没有跟逗号，这边在新增属性的时候前置一个逗号
                                        s.appendRight(insertionPoint, `, ready() {\n${reloadCode}\n}`);
                                    }
                                }
                            }
                        },
                    });

                    chunk.code = s.toString();
                    chunk.map = s.generateMap({ hires: true });
                }
            }
        },

        closeBundle() {
            if (enableWSS) {
                wss?.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(wss_message);
                    }
                });
            }
        },
    };
}

// 判断是否 css asset
function isCSSAsset(chunk: Rollup.OutputChunk | Rollup.OutputAsset): chunk is Rollup.OutputAsset {
    return chunk?.type === 'asset' && chunk.fileName.includes('.css');
}

// 判断是否 JS chunk
function jsJSChunk(chunk: Rollup.OutputChunk | Rollup.OutputAsset): chunk is Rollup.OutputChunk {
    return chunk?.type === 'chunk' && chunk.fileName.match(/.[cm]?js$/) !== null && !chunk.fileName.includes('polyfill');
}

// 判断是否 Editor.Panel.define(...) 代码块
function isEditorPanelDefine(node: Node): node is CallExpression {
    if (node.type !== 'CallExpression') return false;

    const callExpr = node as CallExpression;

    return (
        callExpr.callee.type === 'MemberExpression' &&
        callExpr.callee.object.type === 'MemberExpression' &&
        callExpr.callee.object.object.type === 'Identifier' &&
        callExpr.callee.object.object.name === 'Editor' &&
        callExpr.callee.object.property.type === 'Identifier' &&
        callExpr.callee.object.property.name === 'Panel' &&
        callExpr.callee.property.type === 'Identifier' &&
        callExpr.callee.property.name === 'define'
    );
}

function escapeTemplateString(code: string) {
    return code.replace(/`/g, '\\`').replace(/\${/g, '\\${');
}
