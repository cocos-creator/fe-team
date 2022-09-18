const methods = {
    async open() {
        Editor.Panel.open('template'); 
    },
};

function load() {
    console.log('load');
}

function unload() {
    console.log('unload');
}

module.exports = {
    methods,
    load,
    unload,
};