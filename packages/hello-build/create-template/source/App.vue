<template>
    <div className="hi">
        {{ props.message }} 欢迎使用 vue 3 ，计数器{{ counter }}
        <button @click="clickHandle">
            click 3
        </button>
        <Test />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Test from './hi-test.vue';

const props = defineProps({
    message: {
        type: String,
        required: true,
    },
});

const counter = ref(0);

function clickHandle() {
    counter.value += 1;
}
</script>

<style lang='less' scoped>
.hi {
  color: #fff;
  font-size: 20px;
  button {
    font-size: 24px;
    border-radius: 4px;
  }
}
</style>
