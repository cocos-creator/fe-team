# Headless Component

## 前言

在 2021 年这个时间节点，由于 WEB UI 框架（Angular、React、Vue）的普及，前端人员基于组件开发页面已经成为事实标准。为了应对千变万化的视觉呈现，组件提供了 Props、Slots 来差异化配置。比如一个 Button 组件，可以通过 type 属性来定制是呈现蓝色还是红色；通过 loading 属性来定制按钮是否呈现一个“加载中”的图标。如果有些视图需要整块的定制，那么使用 Slots ，它可以局部甚至全局的替换掉原组件的视图部分，达到特殊的定制效果。

## 局限

现有的 Props 和 Slots 都存在一定的局限性。

Props 定制组件，一般只能定制主题样式的差异，它通常只适用于在视图主体结构相对稳定的情况下做一些样式定制和流程控制。

Slots 定制组件有个很大的限制是我们传入的 Slot 内容，只能获取到组件内部的数据，无法调用组件内部的方法。

举个例子：

如果我们要封装一个新手引导的组件，新手引导一般包括 4 个部分：

-   1、当前步骤的内容
-   2、当前步骤的进度
-   3、步骤控制（上一步&下一步）
-   4、关闭按钮

如下图所示：

<div style="display: flex;align-items: center;justify-content: space-evenly;">
    <img src="/headless/1.png" />
    <img src="/headless/2.png" />
</div>

如果封装一个新手引导的组件，需要满足这 2 个 UI 风格截然不同的设计稿。
仅仅通过 Props 和 Slots 的定制方案是不优雅的，倘若强行配置，也会导致代码结构变复杂，不好维护。

常规组件封装方式如下：

-   在组件内部维护状态和数据
-   在组件内定义方法

```vue
<template>
    <div>
        <div class="info">{{ current }}</div>
        <div class="progress">{{ index + 1 }}/{{ steps.length }}</div>
        <div class="control">
            <button @click="go(-1)">上一步</button>
            <button @click="go(1)">{{ nextText }}</button>
        </div>
        <button class="close" @click="close">X</button>
    </div>
</template>
<script>
export default {
    name: 'intro',
    data () {
        return {
            index: 0
        }
    },
    props: {
        steps: {
            type: Array,
            required: true
        },
        nextText: {
            type: String,
            default：'下一步'
        },
    },
    computed: {
        current() {
            return this.steps[this.index]
        },
    },
    methods: {
        go() {
            // 进行上下步骤的跳转
        },
        close() {
            // 关闭新手引导
        }
    }
}
</script>
```

示例代码中的 `<template></template>` 部分为视图部分，它渲染的数据和调用的方法都是在该组件内部维护的，分别由 Data、 Props、 Computed 和 Methods 定义。

这样的封装方式，缺点很明显，只要 UI 上有一点不同，就需要开放更多的 Props 。

比如需要定制 “下一步”的文案，需要一个 nextText 配置项。

如果显示进度的地方改成了“进度条”的表现形式，则需要开启一个 slot ，使用者传入一个自定义的进度条来替换组件内部的数字进度。

假如 UI 上将进度条与控制栏调换了位置，Props 和 Slots 就无能为力了。

## 方案

Props 和 Slots 的组件定制方案是基于视图的，然而有些组件（e.g.新手引导）最不稳定的其实就是视图层，在不同业务中，不同设计师设计出来的效果几乎都是不一样的。
为了解决 Props 和 Slots 在定制组件上的不足，我们需要切换一下组件封装的思路 —— 基于逻辑抽象来封装组件。
我们把某个组件的数据和方法抽象到一个具体的 Class 里面，不在组件里面维护数据和挂载任何方法，组件只负责数据渲染据和方法调用。这样能让设计师自由的定义 UI 效果，前端开发又能做到最大化的逻辑复用。

我们将采用逻辑抽象的方式来封装组件。示例代码如下：

```js
class Intro {
    constructor(steps, vueInstance) {
        this.index = 0;
        this.steps = steps;
        this.vueInstance = vueInstance;
    }
    get current() {
        return this.steps[this.index];
    }
    go(step) {
        // 进行上下步骤的跳转
    }
    close() {
        // 关闭新手引导
        this.vueInstance.$destroy();
    }
}
```

```vue:line-numbers
<template>
    <div>
        <div class="info">{{ intro.current }}</div>
        <div class="progress">{{ intro.index + 1 }}/{{ intro.steps.length }}</div>
        <div class="control">
            <button @click="intro.go(-1)">上一步</button>
            <button @click="intro.go(1)">{{ nextText }}</button>
        </div>
    </div>
</template>
<script>
import Intro from './intro.js'; // 复用我们封装好的新手引导类

export default {
    name: 'intro',
    props: {
        steps: {
            type: Array, // 所有步骤的数据
            required: true
        },
        nextText: {
            type: String,
            default: '下一步'
        },
    },
    data() {
        return {
            intro: new Intro(this.steps, this),
        }
    },
}
</script
```

先定义好一个 Intro 类，将组件内部维护的 Data、Computed、Methods 都集中在这里维护。它们分别对应 Intro Class 的属性、计算属性、方法。

1、在构造函数（constructor）里，初始化好新手指导需要的步骤数据，即参数上的 steps。任何需要的参数都可以在这边定义。

2、视图组件直接引入 Intro 类，并将其赋值给 data 里的 intro 。至于数据和方法，都是在 intro 上获取的，这样带来的好处是它将适应任何结构的视图组件。

-   第 7 行代码中的下一步动作，是直接调用 intro.go(1)，即向前走一步，它不受限 UI 样式，你只在你需要的地方调用即可。

-   第 3 行代码中，渲染的数据是 intro.current 。因为在初始化 Intro 类的时候， steps 是使用者传入的，所以 intro.current 的数据和数据结构对于使用者来说都是清楚的。可以自由使用。

整个新手引导的抽象逻辑都在 Intro 内部维护，它具有很强的抽象性和稳定性。而不稳定的 UI 部分，使用者可以随意定制，然后通过引入 Intro，实现新手引导需要的一切功能。

## 总结

基于逻辑抽象的方式来封装组件，可以满足在同一交互逻辑下的任意视图呈现。由于数据和方法都被我们抽象封装在与 UI 无关，甚至与框架无关的具体 Class 里，我们的抽象组件可以应用于任何样式的 UI 中。只需要在 UI 上渲染具体 Class 的属性和调用具体 Class 的方法，即可快速定制一个视图百分百还原且逻辑复用的组件。

> 在我写这个篇文章的时候，我其实不知道这种逻辑复用 & UI 随意定制的方式是有个学名的，叫作 —— Headless UI
