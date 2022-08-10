# hello-build

## install

```
npm i @cocos-fe/hello-build -D
```

## 使用

安装完成后，在控制台输入 hi-cocos 则会显示帮助信息

```
hi-cocos 
```

### 生成 dts 文件

插件在构建中，需要用到引擎的 dts，我们封装了一个小脚本用来自动生成，你只需要执行 

```
hi-cocos engine-dts
```

### 开发插件

```
hi-cocos dev plugin-name
```

即可开启实时构建，方便开发。

### 构建插件

```
hi-cocos build [plugin-name]
```

如果传入第二个参数，则只构建指定的插件，否则将全量构建。