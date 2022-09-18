<template>
    <div class="cocos-helper">
        <ui-button @click="clearBuildList">
            清空构建列表
        </ui-button>
        <ui-button @click="toggleDebugerTracker">
            {{ debugerTracker ? '关闭' : '开启' }}埋点日志
        </ui-button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 情空构建列表
async function clearBuildList() {
    var {queue} = await Editor.Message.request('builder', 'query-tasks-info');
    Object.keys(queue).forEach(id => Editor.Message.request('builder', 'remove-task', [id, true]));
}

// 埋点日志
const debugerTracker = ref(false);
onMounted(async function() {
    const value = await Editor.Profile.getConfig('utils', 'features.analytics-debug');
    debugerTracker.value = value;
});
async function toggleDebugerTracker() {
    const value = await Editor.Profile.getConfig('utils', 'features.analytics-debug');
    await Editor.Profile.setConfig('utils', 'features.analytics-debug', !value);
    debugerTracker.value = !value;
}

</script>

<style lang='less' scoped>
.cocos-helper {
    padding: 10px;
    ui-button {
        margin-left: 10px;
    }
}
</style>
