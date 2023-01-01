<script setup>
import SepareteBox from '../../components/separete-box/index.ts'
</script>  

# ALL-IN-JS

前端工程比较凌乱，因为你几乎无可避免的需要 html、Javascript、css 3者配合才能完成一个项目。 在理解一个业务时候，需要3个文件一起看，不够‘专注’。

vue 单文件组件的出现改善了这个局面，它收拢了 html、Javascript、和 css，让他们看起来是一个整体。

## 再激进一点

如果组件结构不太复杂，样式也偏向简单，我建议直接使用 js 来完成所有事情。
> 特别是编辑器现在还没有使用 .vue 开发的情况下，简单的组件通过单一的 .js 文件来封装可以把逻辑都收拢在一个地方，便于维护。

如下，我们有个切割容器的组件，它的功能是将一个容器分为上下2个部分，然后中间有一条线可以动态调节。可以预见它的 html 结构 和 css 样式都是非常简单的，类似这样的组件，我们就可以考虑全部用 js 实现。

<div style="height: 200px;background-color: var(--vp-c-bg-alt);">
    <separete-box>
        <template #top="{height}">{{height}}top</template>
        <template #bottom="{height}">{{height}}bottom</template>
    </separete-box>
</div>

```ts
import {defineComponent, VNode, h} from 'vue'; 

export default defineComponent({
    name: 'SepareteBox',
    props: {
        initPos: {
            type: Number,
            default: 100,
        },
        showSeparete: {
            type: Boolean,
            default: true,
        },
        separeteLineHeight: {
            type: Number,
            default: 10,
        },
    },
    data(){
        return {
            clientHeight: 0,
            h_top: 0,
            clientYCache: 0,
        };
    },
    computed: {
        h_bottom(): number {
            return this.showSeparete 
                ? this.clientHeight - this.h_top - this.separeteLineHeight
                : 0;
        },
    },
    watch: {
        showSeparete() {
            this.init();
        },
    },
    mounted() {
        this.resizeObserver = new ResizeObserver(([entry]) => {
            const { height } = entry.contentRect;
            const p = this.h_top / this.clientHeight;
            if (this.clientHeight !== height) {
                this.clientHeight = height;
                this.h_top = this.showSeparete ? Math.floor(height * p) : height;
            }
        });
        this.resizeObserver.observe(this.$el);

        this.clientHeight = this.$el.getBoundingClientRect().height;
        this.init();
    },
    beforeUnmount() {
        this.resizeObserver.disconnect();  
    },
    methods: {
        init() {
            this.h_top = this.showSeparete 
                ? Math.floor(Math.min(this.initPos, this.clientHeight * 0.8)) 
                : this.clientHeight;
        },
        mousedown(e: MouseEvent) {
            e.stopPropagation();
            this.clientYCache = e.clientY;
        },
        mousemove(e: MouseEvent) {
            if (this.clientYCache === 0) return;
            const value = e.clientY - this.clientYCache;
            const updateValue = this.h_top + value;
            if (updateValue >= 0 && updateValue <= this.clientHeight) {
                this.h_top = updateValue;
            }

            this.clientYCache = e.clientY;
            this.$emit('change', {top: this.h_top});
        },
        mouseup() {
            this.clientYCache = 0;
        },
    },
    render(): VNode {
        return h('div', {
            class: 'separete-box',
            onMousemove: this.mousemove,
            onMouseup: this.mouseup,
            style: {
                display: 'flex',
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                overflow: 'hidden',
            },
        }, [
            h('div', {
                style: { height: this.h_top + 'px'}, 
            }, this.$slots.top?.({height: this.h_top})),

            (this.showSeparete 
                ? h('div', { 
                    style: {
                        height: this.separeteLineHeight + 'px',
                        '--height': this.separeteLineHeight + 'px',
                        position: 'relative',
                        zIndex: 10,
                    },
                    onMousedown: this.mousedown,
                    onMouseup: this.mouseup,
                }, [h('div', {
                    style: {
                        position: 'absolute',
                        left: 0,
                        top: 'calc((var(--height) - 2px) / 2)',
                        width: '100%',
                        height: '2px',
                        backgroundColor: 'aqua',
                        cursor: 'ns-resize',
                    },
                })]) 
                : null
            ),

            h('div', {
                style: {flex: 1},
                'data-info': `${this.clientHeight} - ${this.h_top} - ${this.separeteLineHeight} = ${this.h_bottom}`,
            }, this.$slots.bottom?.({height: this.h_bottom})),
        ]);
    },
});
```

这样 `结构` 、`样式` 、 `逻辑` 都通过 js 实现的组件维护起来更舒服，不割裂。