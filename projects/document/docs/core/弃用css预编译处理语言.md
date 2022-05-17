---
sidebarDepth: 3
---

# 弃用css预编译处理语言

在非组件化开发的时代，开发者喜欢将逻辑功能抽象成一个插件（JQ插件典型），同时将高频用到的样式组装成某个class（css 选择器），也就是人们说的原子类，最典型的应该莫过于.clear （清浮动功能）。

**这是一个没有webpack，postcss的时代。**


这时候 css 预编译处理语言 (less sass stylus) 的出现受到了人们的极大欢迎，乃至现在几乎没有人使用原生 css 写样式。对于css的预编译的优点大致归纳为：

- 嵌套样式 （极大的提高了css的书写效率，减少不必要的重复代码）
- Mixin   (方便的将通用样式统一维护，类似刚才提到的原子类，也很多人用来解决浏览器前缀补全的问题)
- 变量     (方便全局控制，比如主题制作等)

:::tip
以上只列出个人认为被开发者依赖性最强的特性，是人们到现在都不愿意书写原生 css 的最大壁垒。
:::


**时间来到 2022 年，是时候思考一下我们是否应该继续使用这些 css 预编译处理语言了。**

当下 [css 3](https://cssnext.github.io/) 已经不断完善，配合上 [postcss](https://www.postcss.com.cn/) ，我们已经可以使用原生 css 实现之前需要预编译处理语言才能达到的效果。

下面我就针对以上列出的 3 大刚需，展示 css 3 对应的解决方案。

### 嵌套样式

```less
// 预编译处理

.card {
    display: block;
    .title {
        font-size: 12px;
    }
    .body {
        height: 50px;
    }
}
```

```css
// 原生 css 

.card {
    display: block;
    & .title {
        font-size: 12px;
    }
    & .body {
        height: 50px;
    }
}
```

css 3 里使用 `&` 表示父级选择器，这样我们就可以书写原生的嵌套样式了。

### Mixin 

```scss
// 预编译处理

@mixin circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

.box {
    @include circle;
}
```

```css
// 原生 css 

:root {
  --danger-theme: {
    color: white;
    background-color: red;
  }
}

.danger {
  @apply --danger-theme;
}
```

当然 scss 的 mixin 还支持传参数以达到灵活的定制，不过大部分情况，原生已经可以满足需求。

### 变量

大家已经广泛使用了，就不多赘述，而且原生的 css 变量其实比预编译处理语言的更灵活，可以根据条件覆写。非常合适主题动态替换的场景。

## 为什么弃用

### 遵循标准

css 3 是 css 的标准语言，遵循标准能让我们的项目没有历史负担，随着浏览器对新特性的支持，我们可以直接去掉 postcss，让 css 代码直接跑在浏览器上。

### 工程更新

现代的前端工程，针对 css 的构建，当下比较“流行“ 的 postcss ，它不像 scss 和 less 发明自己的语法，而是让你书写最新的标准语法，帮你按需的编译成目标浏览器能解析的语法。(类比 javascript 的 babel)

### 结合项目

我们的编辑器项目依赖了最新的 chrome 内核（如果我们保持升级的话），而且没有兼容其他浏览器的负担，只要 chrome 对某个 css 的特性跟进支持，postcss 就不会多余编译，这样可以最小化我们的 css 构建产物。