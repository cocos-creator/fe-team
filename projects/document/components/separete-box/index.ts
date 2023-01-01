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
            if (updateValue >= 0 && updateValue <= this.clientHeight - this.separeteLineHeight) {
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