# Git 教程

## Git 文档
[官方文档](https://git-scm.com/docs)

## git alias
使用 zsh 的 plugin, [zsh-plugins-git](https://gitee.com/mirrors/oh-my-zsh/tree/master/plugins/git)

## git branch
- git branch 查看本地分支
- git branch -r 查看远程分支
- git branch -a 查看本地&远程分支
- git branch -d xxx 删除本地分支
- git push origin --delete xxxx 删除远程分支

- git branch -r | grep yuanshuai  查看远程的包含 yuanshuai 的分支
- git branch | grep yuanshuai | xargs git branch -D 批量删除本地分支
- git branch -a | grep -v -E 'master|develop' | xargs git branch -D // 只保留 master 等分支
- git branch -r | grep -v -E 'master|develop' | sed 's/origin\///g' | xargs -I {} git push origin :{}
- git branch -r | grep 'yuanshuai' | xargs -I {} basename {} | xargs -I {} git push origin :{} // 批量删除远程分支
- git remote prune origin  // 刷新一下分支列表

## git checkout
- git checkout xxx 切换到某个分支
- git checkout . 放弃本次修改
- git checkout -b xxx origin/xxx 创建一个和远程分支关联的分支
- git checkout -b xxx 创建一个新分支
- git push origin xxx 将本地分支提交到远程


## git  merge 
git merge --abort 取消上一次合并

## git tag

- git tag -a tagName -m '标签的说明' // -a annotated
- git push origin tagName // 推送到远程

## git log
git log --author=alan // 过滤作者名称
--oneline // 每条记录只显示一行

## .gitignore
- 以斜杠“/”开头表示目录
- 以星号“*”通配多个字符
- 以问号“?”通配单个字符
- 以方括号“[]”包含单个字符的匹配列表
- 以叹号“!”表示不忽略(跟踪)匹配到的文件或目录
- git 对于 .ignore 配置文件是按行从上到下进行规则匹配的，意味着如果前面的规则匹配的范围更大，则后面的规则将不会生效
- 只能作用于 Untracked Files，也就是那些从来没有被 Git 记录过的文件（自添加以后，从未 add 及 commit 过的文件）

## git stash

- git stash save {name}
- git stash list
- git stash pop 
- git stash apply {index}
- git stash drop {index}

## git reset
git reset --soft HEAD~1 撤销上一次的提交

## git cherry-pick 
 git cherry-pick commitId1 commitId2 将其他分支的 commit 摘取过来 

## 一点点不同
如果你之前的 Git 协作是在同一个仓库，大家创建各自的分支，完成功能之后往 `dev` `release` `master` 3个分支去合并。它们分别对应测试、预发、正式环境。

那么我们现在的 Git 协作有点不同。

我们采用开源项目通用的 Git 协作方式，你需要把主仓库 fork 到你个人账号下，然后创建功能分支，完成需求之后往主仓库去提 PR。

具体流程可以参考下图：

<picture>
  <img src="../assets/git.jpg" alt="Image">
</picture>

所以我们需要用到 Git 的多 origin 管理功能：

```
git remote add [shortname] [url]
```
如下是我在本地仓库设置的多个源：

<picture>
  <img src="../assets/git-remote.png" alt="Image">
</picture>

这样的协作方式虽然麻烦一点，但是可以保证 commit 的简洁，也不会造成主仓库的分支灾难。

## 如何协作

单一源的协作非常方便，因为大家分支都在同一个地方，可以相互合并。多源的协作方式稍微麻烦点，假如`开发A`的某个功能依赖了`开发B`的某个分支，我们有2种情况可以参考：

### 开发B的分支可以单独提测

可以让`开发B`先将自己的功能分支提PR到主仓库，待合并之后，`开发A`再从主仓库切出最新分支进行开发。此时`开发A`在完成功能之后，可以独立的提PR到主仓库。

### 开发AB的功能需要合并一起才能提测

此时 `开发A` 就应该将 `开发B` 的源添加到自己的本地仓库，然后从`开发B` 的源切出功能分支，在此基础上做开发，待功能完成后，由`开发A` 向 `开发B` 发起 PR，最终由 `开发B` 向主仓库发起 PR。

## 如何 review 

如果是简单的功能我们可以直接通过 PR 地址进行review，对于复杂一些的功能，我们应该在本地对功能进行验证。此时可以使用 Git 命令将当前 PR 拉到本地进行验证。

```
git fetch origin pull/{id}/head:{branchname} 
```

- id: PR 的id
- branchname: 你本地创建的新分支的名称