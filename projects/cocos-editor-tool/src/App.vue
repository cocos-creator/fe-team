
<template>
    <div>
        <button @click="fn1">
            发给面板
        </button> 
        <button @click="fn2">
            查询 {{ queryInfo }}
        </button> 
        <button>
            当前语言：{{ lang }}
        </button> 
    </div>
</template>

<script setup lang="ts"> /* allowJs: true */
/* eslint-disable no-undef */

import {ref} from 'vue';

const lang = ref('zh');
const queryInfo = ref('');

globalThis.hostAPI?.ipcRenderer.on('ping', (event, message) => {
    console.log('webview 接收到的消息: ', event, message);

    switch (message.channel) {
        case 'query-info':
            queryInfo.value = message.value;
            break;
        case 'i18n':
            lang.value = message.value;
            break;
    }
});

function fn1() {
    globalThis.hostAPI.sendToHost('test1', 1, 2, 3);
}
function fn2() {
    globalThis.hostAPI.sendToHost('query-info');
}

</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
