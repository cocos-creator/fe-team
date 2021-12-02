# Git 教程

如果你之前的 Git 协作是在同一个仓库，大家创建各自的分支，完成功能之后往 `dev` `release` `master` 3个分支去合并。它们分别对应测试、预发、正式环境。

那么我们现在的 Git 协作有点不同。

我们采用开源项目通用的 Git 协作方式，你需要把主仓库 fork 到你个人账号下，然后创建功能分支，完成需求之后往主仓库去提 PR。

具体流程可以参考下图：

<picture>
  <img src="../assets/git 工作流.jpg" alt="Image">
</picture>