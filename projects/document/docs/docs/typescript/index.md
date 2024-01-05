# TypeScript 笔记

## 类型谓词（Type Predicates）

在 TypeScript 中，类型谓词是一种用于告诉编译器某个变量的确切类型的方式。它通常与自定义类型保护函数一起使用。类型谓词函数具有特定的形式，它们返回一个布尔值，用于在特定作用域内缩小某个变量的类型。

```typescript
// 定义两种类型 A 和 B
type A = {
    type: 'A';
    // 其他类型 A 的属性
};

type B = {
    type: 'B';
    // 其他类型 B 的属性
};

// 自定义类型保护函数，判断是否为类型 A
function isTypeA(item: A | B): item is A {
    return (item as A).type === 'A';
}

// 使用类型谓词
const exampleA: A = { type: 'A' };
const exampleB: B = { type: 'B' };

if (isTypeA(exampleA)) {
    // 在这个作用域中，exampleA 被认为是类型 A
    console.log(exampleA.type);
} else {
    // 在这个作用域中，exampleA 被认为是类型 B
    console.log(exampleA.type);
}
```

在上述例子中，isTypeA 是一个类型谓词函数，用于检查传入的参数是否为类型 A。当使用 isTypeA 函数进行判断后，在相应的作用域内，TypeScript 将正确地缩小变量的类型，以便进行类型安全的操作。

类型谓词的形式为 parameterName is Type，其中 parameterName 是函数参数的名称，Type 是希望缩小到的类型。这种形式告诉 TypeScript 在函数返回 true 时，将 parameterName 视为 Type 类型。
