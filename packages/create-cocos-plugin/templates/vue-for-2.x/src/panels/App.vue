<script setup lang="js">
import { inject } from 'vue';

import { ElMessage } from 'element-plus';

import { name } from '../../package.json';

import HelloWorld from './components/HelloWorld.vue';
import { state } from './pina';
import { keyAppRoot, keyMessage } from './provide-inject';

const appRootDom = inject(keyAppRoot);
const message = inject(keyMessage);

const open = () => {
    ElMessage({
        message: 'show message',
        appendTo: appRootDom,
    });
};

function open2() {
    message({ message: 'show inject message' });
}

async function send2main() {
    Editor.Ipc.sendToMain('abc:clicked');
}
</script>

<template>
    <div>
        <a href="https://vitejs.dev" target="_blank">
            <img src="./assets/vite.svg" class="logo" alt="Vite logo" />
        </a>
        <a href="https://vuejs.org/" target="_blank">
            <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
        </a>
        <a href="https://www.cocos.com/" target="_blank">
            <img src="./assets/cocos.png" class="logo cocos" alt="Cocos logo" />
        </a>
        <a href="https://element-plus.org/zh-CN/" target="_blank">
            <img src="./assets/element-plus-logo.svg" class="logo element" alt="element-plus logo" />
        </a>
    </div>
    <HelloWorld msg="Vite + Vue + Cocos Creator + element-plus" />
    <el-button type="primary" @click="open"> show message </el-button>
    <el-button type="danger" @click="open2"> show inject message </el-button>
    <el-button type="default" @click="send2main"> Send To Main </el-button>

    <p>Try to click the menu: [ Extension/{{ name }}/increase ] {{ state.a }}</p>
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
