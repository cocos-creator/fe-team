<template>
    <div
        ref="root"
        class="virtual-list-container"
        @scroll="manager.handleScroll"
    >
        <div :style="{ height: `${manager.totalHeight}px` }">
            <ul
                class="list"
                :style="{ transform: `translateY(${manager.translateY}px)` }"
            >
                <li
                    v-for="(item, index) in manager.showList"
                    :key="item.id"
                    :data-index="index"
                    class="item"
                >
                    {{ item.text }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import Manager from './index.js';
import { ref, reactive, onMounted } from 'vue';

const root = ref(null);
const manager = reactive(new Manager());

onMounted(() => {
    const { height } = root.value.getBoundingClientRect();
    manager.init(height, 60);
    manager.fetchItem();
});
</script>

<style>
.virtual-list-container {
    margin: 20px auto;
    width: 300px;
    height: 500px;
    background-color: cadetblue;
    overflow-y: auto;
}
.virtual-list-container ul {
    margin: 0;
    padding: 0;
}
.virtual-list-container li {
    box-sizing: border-box;
    list-style: none;
    height: 60px;
    line-height: 60px;
    border: 1px solid #333;
    text-align: center;
    font-size: 14px;
}
</style>
