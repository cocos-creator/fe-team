// element-plus 的全局变量是作用在 :root , 需要改成 :host
// 黑暗模式它是在 html 添加 dark 类名，我们应该在最外层的 #app 添加 class="dark"
export function cssTransform(css: string): string {
    return css.replaceAll(':root', ':host').replaceAll('html.dark', '#app.dark');
}
