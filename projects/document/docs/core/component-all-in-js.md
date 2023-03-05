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

<ClientOnly>
<div style="height: 200px;background-color: var(--vp-c-bg-alt);">
    <separete-box>
        <template #top="{height}">{{height}}top</template>
        <template #bottom="{height}">{{height}}bottom</template>
    </separete-box>
</div>
</ClientOnly>

<<< components/separete-box/index.ts

这样 `结构` 、`样式` 、 `逻辑` 都通过 js 实现的组件维护起来更舒服，不割裂。