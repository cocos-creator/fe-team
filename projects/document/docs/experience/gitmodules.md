# Gitmodules

## 起因

我们给工作流添加了 vue3 的构建支持，然后为了验证工作流能否正常工作，我临时在 cocos-editor 仓库的 app/builtin/ 下添加了一个用于测试构建的插件 xxx，问题是这个插件 xxx 也是一个 git 项目，这是问题的根本原因。

其实 Git 当时是有给出提示的，我没怎么注意，直接 add . 添加了。

```bash{7,12}
warning: adding embedded git repository: online-x-extensions
hint: You've added another git repository inside your current repository.
hint: Clones of the outer repository will not contain the contents of
hint: the embedded repository and will not know how to obtain it.
hint: If you meant to add a submodule, use:
hint:
hint: 	git submodule add <url> online-x-extensions
hint:
hint: If you added this path by mistake, you can remove it from the
hint: index with:
hint:
hint: 	git rm --cached online-x-extensions
hint:
hint: See "git help submodule" for more information.
```

Git 有给出提示，让我将其添加为 submodule ，当时我只是简单去把 online-x-extensions 下面的 .git 文件夹删除，因为我不需要 submodule。然后 git add .  提交了代码。


## 问题

在本地一切都还是正常的，但是项目在 CI 环节报错了。

因为我们在 CI 流程一般都会使用 `actions/checkout` 来拉最新的代码到开发机器。它内部有个遍历 .gitmodules 文件的操作，将子仓库都拉下来，但是由于我们在提交 online-x-extensions 这个插件的时候，没有按照 git 提示的命令去操作，只是删除了 .git 文件夹然后提交了代码，导致 Git 生成了一个残缺的 .gitmodules.

```bash
Error: fatal: No url found for submodule path 'app/builtin/online-x-extensions' in .gitmodules 
```

## 解决

通过 [actions/checkou issue](https://github.com/actions/checkout/issues/354) 的解决方案

```bash
git rm --cached online-x-extensions
```

其实就是 Git 在发现你添加了一个仓库项目到本项目时提示的命令，当时忽略了。

## 总结

谨慎对待每个 warning ，不要侥幸操作。