import './style.css';
// import './panel2.css';

export default Editor.Panel.define({
    template: '<div id="app"></div>', // 只留一个 div 用于 vue 的挂载
    $: {
        root: '#app',
    },
    ready() {},
    close() {},
});
